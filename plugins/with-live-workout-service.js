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

module.exports = (config) =>
  withSmallIcon(withForegroundService(withPermissions(config)));
