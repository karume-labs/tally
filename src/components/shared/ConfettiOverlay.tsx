import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";

interface ConfettiOverlayProps {
  visible: boolean;
  onDone?: () => void;
}

const COLORS = ["#4ade80", "#fbbf24", "#f472b6", "#60a5fa", "#a78bfa"] as const;

// Precomputed at module load so each piece keeps a stable identity across renders.
const PIECES = Array.from({ length: 40 }, (_, i) => ({
  id: `confetti-${i}`,
  color: COLORS[i % COLORS.length],
  left: (i * 9) % 100,
  spin: (i * 47) % 360,
  dropOffset: (i % 5) * 12,
}));

export const ConfettiOverlay = ({ visible, onDone }: ConfettiOverlayProps) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!visible) {
      setFrame(0);
      return;
    }
    setFrame(1);
    const t = setTimeout(() => {
      setFrame(2);
      const d = setTimeout(() => {
        setFrame(0);
        onDone?.();
      }, 350);
      return d;
    }, 700);
    return () => {
      clearTimeout(t);
    };
  }, [visible, onDone]);

  if (frame === 0) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {PIECES.map((piece) => (
        <View
          key={piece.id}
          style={[
            styles.piece,
            {
              backgroundColor: piece.color,
              top: frame === 1 ? 40 : 120 + piece.dropOffset,
              left: piece.left,
              opacity: frame === 2 ? 1 : 0,
              transform: [{ rotate: `${piece.spin}deg` }],
            },
          ]}
        />
      ))}
      <Text style={styles.label}>
        {frame === 1 ? "PR!" : frame === 2 ? "NICE!" : ""}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  piece: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  label: {
    fontSize: 48,
    position: "absolute",
    color: "#fbbf24",
    fontWeight: "800",
  },
});
