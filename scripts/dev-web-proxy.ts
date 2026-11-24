// Dev-only reverse proxy in front of `expo start` (Metro on :8091).
//
// expo-sqlite's web implementation blocks on SharedArrayBuffer/Atomics between
// the main thread and its worker. Browsers only expose SharedArrayBuffer to
// cross-origin-isolated pages, and `expo start` offers no hook to add the
// required COOP/COEP headers. This proxy forwards every HTTP request and
// WebSocket upgrade to Metro and injects those headers, so DB-backed screens
// run in the browser.
//
// Usage: bunx expo start --port 8091   (terminal 1)
//        bun run dev:web               (terminal 2)  -> http://localhost:8092

import http from "node:http";
import net from "node:net";

const UPSTREAM_PORT = 8091;
const PORT = 8092;

const ISOLATION_HEADERS = {
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-embedder-policy": "require-corp",
};

// expo-sqlite spawns its worker as `new Worker(new URL('./worker', location))`,
// so the browser requests /worker as a plain script. Metro's dev server has no
// route for it and falls back to the HTML shell, which the Worker rejects.
// Serve Metro's prebuilt worker bundle at that path instead.
const WORKER_BUNDLE_PREFIX = "/node_modules/expo-sqlite/web/worker.bundle";
const WORKER_BUNDLE_PATH = `${WORKER_BUNDLE_PREFIX}?platform=web&dev=true&minify=false`;

// The app constructs the worker from the Metro bundle URL, not `/worker`, so
// both spellings have to hit the cache.
const isWorkerRequest = (url: string | undefined): boolean =>
  url === "/worker" || (url?.startsWith(WORKER_BUNDLE_PREFIX) ?? false);

const fetchWorkerBundle = (): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const upstream = http.request(
      {
        host: "localhost",
        port: UPSTREAM_PORT,
        path: WORKER_BUNDLE_PATH,
        method: "GET",
        headers: { accept: "*/*" },
      },
      (upstreamRes: http.IncomingMessage) => {
        if ((upstreamRes.statusCode ?? 500) >= 300) {
          upstreamRes.resume();
          reject(new Error(`worker bundle ${upstreamRes.statusCode}`));
          return;
        }
        const chunks: Buffer[] = [];
        upstreamRes.on("data", (chunk: Buffer) => chunks.push(chunk));
        upstreamRes.on("end", () => resolve(Buffer.concat(chunks)));
      },
    );
    upstream.on("error", reject);
    upstream.end();
  });

// Metro rebuilds this bundle on every request, which takes seconds. The page's
// first DB call is synchronous and gives up after a short timeout, so the
// worker body is cached once and served immediately from then on.
let cachedWorker: Buffer | null = null;
let inflightWorker: Promise<Buffer> | null = null;

const getWorkerBundle = () => {
  if (cachedWorker != null) return Promise.resolve(cachedWorker);
  if (inflightWorker == null) {
    inflightWorker = fetchWorkerBundle()
      .then((body) => {
        cachedWorker = body;
        inflightWorker = null;
        return body;
      })
      .catch((err) => {
        inflightWorker = null;
        throw err;
      });
  }
  return inflightWorker;
};

const serveWorkerBundle = async (
  _req: http.IncomingMessage,
  res: http.ServerResponse,
) => {
  try {
    const body = await getWorkerBundle();
    res.writeHead(200, {
      ...ISOLATION_HEADERS,
      "content-type": "application/javascript; charset=UTF-8",
      "content-length": body.length,
    });
    res.end(body);
  } catch {
    res.writeHead(502, ISOLATION_HEADERS);
    res.end();
  }
};

const server = http.createServer((req, res) => {
  // Request log keeps dev debugging possible when Metro sits behind the proxy.
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  if (req.method === "GET" && isWorkerRequest(req.url)) {
    void serveWorkerBundle(req, res);
    return;
  }
  const upstream = http.request(
    {
      host: "localhost",
      port: UPSTREAM_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (upstreamRes: http.IncomingMessage) => {
      res.writeHead(upstreamRes.statusCode ?? 502, {
        ...upstreamRes.headers,
        ...ISOLATION_HEADERS,
      });
      upstreamRes.pipe(res);
    },
  );
  upstream.on("error", () => res.destroy());
  req.pipe(upstream);
});

// Metro's HMR socket arrives as an HTTP Upgrade; splice the bytes straight
// through so hot reload keeps working behind the proxy.
server.on(
  "upgrade",
  (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const upstream = net.connect(UPSTREAM_PORT, "localhost", () => {
      // Point Host at the upstream so Metro's ws server accepts the handshake.
      const headers: string[] = [];
      for (let i = 0; i < req.rawHeaders.length; i += 2) {
        const name = req.rawHeaders[i];
        const value =
          name.toLowerCase() === "host"
            ? `localhost:${UPSTREAM_PORT}`
            : req.rawHeaders[i + 1];
        headers.push(`${name}: ${value}`);
      }
      const requestLines = [
        `${req.method ?? "GET"} ${req.url ?? "/"} HTTP/1.1`,
        ...headers,
        "",
        "",
      ];
      upstream.write(requestLines.join("\r\n"));
      if (head.length > 0) upstream.write(head);
      upstream.pipe(socket);
      socket.pipe(upstream);
    });
    upstream.on("error", () => socket.destroy());
    socket.on("error", () => upstream.destroy());
  },
);

// Metro may still be booting, so retry until the worker bundle is prepared.
const prewarmWorker = async (attempt = 0): Promise<void> => {
  try {
    await getWorkerBundle();
    console.log("Tally web dev proxy: worker bundle cached");
  } catch {
    if (attempt < 60) setTimeout(() => void prewarmWorker(attempt + 1), 1000);
  }
};

server.listen(PORT, () => {
  console.log(
    `Tally web dev proxy: http://localhost:${PORT} -> http://localhost:${UPSTREAM_PORT} (cross-origin isolated)`,
  );
  void prewarmWorker();
});
