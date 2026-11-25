import { Stack } from "expo-router";
import { WorkoutHeaderActions } from "./WorkoutHeaderActions";

interface WorkoutNavHeaderProps {
  elapsed: number;
  showCancel: boolean;
  onCancel: () => void;
}

/** Nav-header configuration for this route; renders no layout of its own. */
export const WorkoutNavHeader = ({
  elapsed,
  showCancel,
  onCancel,
}: WorkoutNavHeaderProps) => (
  <Stack.Screen
    options={{
      headerRight: () => (
        <WorkoutHeaderActions
          elapsed={elapsed}
          showCancel={showCancel}
          onCancel={onCancel}
        />
      ),
    }}
  />
);
