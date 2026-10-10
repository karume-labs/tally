import { registerRootComponent } from 'expo';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

// Register the widget task handler so widgets can render and handle clicks.
// This must run before the app root so the handler is registered early.
registerWidgetTaskHandler(() => {
  // TODO: implement widget task handler after widgets are scaffolded.
  // For now this is a no-op placeholder that keeps registration valid.
  return Promise.resolve();
});

// Register the expo-router root layout.
// The actual root layout lives at app/_layout.tsx; expo-router resolves it
// via the metro config + expo-router plugin. This entry point is primarily
// here so registerWidgetTaskHandler can run first.
import '@/app/_layout';
