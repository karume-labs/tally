import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useWorkoutSession } from "@/features/workout/hooks/use-workout-session";
import { finishWorkout } from "@/features/workout/services/finish-workout";
import { endLiveWorkout } from "@/services/live-workout";
import { syncTodayWidget } from "@/services/sync-today-widget";
import { refreshWidgets } from "@/services/widget-refresh";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useWorkoutStore } from "@/stores/use-workout-store";

/** Finishing and cancelling a session, both of which leave this screen. */
export const useSessionExit = () => {
  const router = useRouter();
  const session = useWorkoutSession();
  const rolloverHour = useSettingsStore((s) => s.settings.rolloverHour);
  const sessionId = useWorkoutStore((s) => s.sessionId);
  const [finishing, setFinishing] = useState(false);

  // The widget deep-links here on a cold start, where there is no screen to
  // go back to; fall back to the Today tab instead of leaving the app.
  const goBackOrToday = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/today");
  }, [router]);

  const finish = useCallback(async () => {
    if (sessionId == null || finishing) return;
    setFinishing(true);
    try {
      const result = session.finishSession();
      await finishWorkout({
        sessionId,
        result,
        rolloverHour,
      });
      // The widget was told a session started; clearing it here covers finishing
      // from the notification, where no screen transition follows.
      syncTodayWidget(false).then(refreshWidgets);
      router.replace("/workout/summary");
    } catch (err) {
      // The session is already closed in memory, so surface the failure rather
      // than leaving the screen on a button that no longer responds.
      console.error("[workout] finish failed:", err);
    } finally {
      await endLiveWorkout();
      setFinishing(false);
    }
  }, [sessionId, finishing, session, rolloverHour, router]);

  const cancel = useCallback(() => {
    Alert.alert(
      "Cancel this session?",
      "Nothing logged so far will be saved.",
      [
        { text: "Keep going", style: "cancel" },
        {
          text: "Cancel session",
          style: "destructive",
          onPress: () => {
            session.cancelSession();
            endLiveWorkout();
            syncTodayWidget(false).then(refreshWidgets);
            goBackOrToday();
          },
        },
      ],
    );
  }, [session, goBackOrToday]);

  return { finish, cancel, goBackOrToday };
};
