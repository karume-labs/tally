const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require("expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

// The library declares the service itself; prebuild only has to give it a type
// and the permissions Android 14+ verifies at startForeground() time.
const SERVICE_NAME = "app.notifee.core.ForegroundService";
const SERVICE_TYPE = "health";
const TOOLS_NAMESPACE = "http://schemas.android.com/tools";

const PERMISSIONS = [
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_HEALTH",
  // A `health` service may only start when the app also holds one sensor
  // permission. This one is granted at install, so it costs no prompt.
  "android.permission.HIGH_SAMPLING_RATE_SENSORS",
  "android.permission.POST_NOTIFICATIONS",
  // Non-runtime opt-in for Android 16 Live Updates. Without it the system
  // refuses to promote an ongoing notification, whatever the notification asks
  // for; on older releases it is an unused string in the manifest.
  "android.permission.POST_PROMOTED_NOTIFICATIONS",
];

const SMALL_ICON_NAME = "ic_stat_tally";

// Status bar icons are masked from the alpha channel, so the launcher's
// adaptive icon cannot be reused: it renders as a blank square.
const SMALL_ICON_XML = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="24dp"
  android:height="24dp"
  android:viewportWidth="24"
  android:viewportHeight="24">
  <path
    android:fillColor="#FFFFFFFF"
    android:pathData="M2,9h4v6h-4zM7,11h10v2h-10zM18,9h4v6h-4z" />
</vector>
`;

const withPermissions = (config) =>
  AndroidConfig.Permissions.withPermissions(config, PERMISSIONS);

const withForegroundService = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.$ = manifest.$ || {};
    manifest.$["xmlns:tools"] = manifest.$["xmlns:tools"] || TOOLS_NAMESPACE;

    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults,
    );
    const services = application.service || [];
    const existing = services.find(
      (service) => service.$ && service.$["android:name"] === SERVICE_NAME,
    );
    const service = existing || { $: { "android:name": SERVICE_NAME } };
    service.$ = {
      ...service.$,
      "android:name": SERVICE_NAME,
      "android:foregroundServiceType": SERVICE_TYPE,
      // Older library releases hard-coded a service type, and the merger
      // refuses to keep two of them.
      "tools:replace": "android:foregroundServiceType",
    };
    if (!existing) services.push(service);
    application.service = services;

    return config;
  });

const withSmallIcon = (config) =>
  withDangerousMod(config, [
    "android",
    async (config) => {
      const drawableDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "drawable",
      );
      await fs.promises.mkdir(drawableDir, { recursive: true });
      await fs.promises.writeFile(
        path.join(drawableDir, `${SMALL_ICON_NAME}.xml`),
        SMALL_ICON_XML,
      );
      return config;
    },
  ]);

// Android 16 promotes an ongoing notification to a Live Update only when it
// opts in with the `android.requestPromotedOngoing` extra. The library builds
// every notification itself and exposes no option for this, and a posted
// notification cannot be edited afterwards, so the one hook available is its
// builder source. Prebuild appends the opt-in there, guarded by API level and
// by `asForegroundService`, so ordinary notifications are untouched and older
// devices behave exactly as before.
const NOTIFICATION_MANAGER_JAVA = path.join(
  "node_modules",
  "react-native-notify-kit",
  "android",
  "src",
  "main",
  "java",
  "app",
  "notifee",
  "core",
  "NotificationManager.java",
);

const PROMOTION_MARKER = "TALLY_PROMOTED_ONGOING";
const PROMOTION_ANCHOR = "builder.setExtras(notificationModel.getData());";
const PROMOTION_PATCH = `${PROMOTION_ANCHOR}

            // ${PROMOTION_MARKER}: ask Android 16 to promote this ongoing
            // notification to a Live Update. Ignored below API 36 and when the
            // user has Live Updates switched off, so this is a no-op there.
            if (Build.VERSION.SDK_INT >= 36
                && Boolean.TRUE.equals(androidModel.getAsForegroundService())) {
              Bundle promotedOngoing = new Bundle();
              promotedOngoing.putBoolean("android.requestPromotedOngoing", true);
              builder.addExtras(promotedOngoing);
            }`;

const withPromotedOngoing = (config) =>
  withDangerousMod(config, [
    "android",
    async (config) => {
      const file = path.join(
        config.modRequest.projectRoot,
        NOTIFICATION_MANAGER_JAVA,
      );
      if (!fs.existsSync(file)) {
        console.warn(
          "[tally] react-native-notify-kit is missing; skipped the Live Update patch.",
        );
        return config;
      }

      const source = await fs.promises.readFile(file, "utf8");
      // Idempotent: prebuild runs on every build, and dependencies may be
      // reinstalled underneath it.
      if (source.includes(PROMOTION_MARKER)) return config;
      if (!source.includes(PROMOTION_ANCHOR)) {
        console.warn(
          "[tally] NotificationManager.java changed shape; Live Update promotion was not patched in.",
        );
        return config;
      }

      await fs.promises.writeFile(
        file,
        source.replace(PROMOTION_ANCHOR, PROMOTION_PATCH),
      );
      return config;
    },
  ]);

module.exports = (config) =>
  withPromotedOngoing(
    withSmallIcon(withForegroundService(withPermissions(config))),
  );
