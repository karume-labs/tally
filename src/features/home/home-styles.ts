import { StyleSheet } from "react-native";

const CARD_BG = "#1a1a2e";
const BORDER = "#2a2a40";
const WORKOUT = "#4ade80";
const MUTED = "#9ca3af";
const FORE = "#e5e5e5";

export default StyleSheet.create({
  screen: { flex: 1, backgroundColor: "hsl(0 0% 4%)" },
  content: { padding: 16 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 28, fontWeight: "800", color: FORE },
  subGreeting: { fontSize: 16, color: MUTED, marginTop: 4 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  streakRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  streakMeta: { marginLeft: 12 },
  streakLabel: { fontSize: 22, fontWeight: "700", color: FORE },
  xpRow: { marginTop: 4 },
  xpBarBg: {
    height: 8,
    backgroundColor: "#2a2a40",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  xpBar: { height: "100%", backgroundColor: WORKOUT, borderRadius: 4 },
  xpTextRow: { flexDirection: "row", justifyContent: "space-between" },
  xpText: { fontSize: 14, fontWeight: "600", color: WORKOUT },
  xpTextMuted: { fontSize: 12, color: MUTED },
  todayHeader: { marginBottom: 8 },
  todayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todayTitle: { fontSize: 18, fontWeight: "600", color: FORE },
  restBadge: {
    backgroundColor: "#2a4a3a",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: WORKOUT,
  },
  restText: { fontSize: 12, color: WORKOUT, fontWeight: "600" },
  todayExerciseLabel: { fontSize: 14, color: MUTED, marginBottom: 8 },
  exercisePreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  exerciseChip: {
    backgroundColor: "#2a2a40",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  exerciseName: { fontSize: 13, color: FORE },
  moreText: {
    fontSize: 13,
    color: MUTED,
    alignSelf: "center",
    marginLeft: 4,
  },
  startButton: { marginTop: 4, backgroundColor: WORKOUT, borderRadius: 12 },
  startButtonText: { color: "#0a0a14", fontWeight: "700", fontSize: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: FORE,
    marginBottom: 12,
  },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dayLetter: { fontSize: 12, fontWeight: "600", color: MUTED },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionButton: { flex: 1, borderRadius: 12 },
  actionText: { fontSize: 14, fontWeight: "600" },
});
