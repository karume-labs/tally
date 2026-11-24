import { StyleSheet } from "react-native";

const CARD_BG = "#1a1a2e";
const BORDER = "#2a2a40";
const WORKOUT = "#4ade80";
const MUTED = "#9ca3af";
const FORE = "#e5e5e5";
const PR_COLOR = "#fbbf24";

export default StyleSheet.create({
  exCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  exCardActive: {
    borderColor: WORKOUT,
  },
  exHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exName: { fontSize: 16, fontWeight: "600", color: FORE, flex: 1 },
  exTarget: { fontSize: 13, color: MUTED },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    gap: 8,
  },
  setRowActive: { backgroundColor: "#1a1a2e" },
  setNum: { fontSize: 12, color: MUTED, width: 48 },
  setInputs: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  setInput: {
    backgroundColor: "#2a2a40",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: FORE,
    width: 64,
    textAlign: "center",
  },
  rpeInput: { width: 48 },
  inputSep: { color: MUTED, fontSize: 12 },
  setRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  setDone: { flexDirection: "row", alignItems: "center", gap: 4 },
  setDoneText: { fontSize: 12, color: MUTED, fontWeight: "600" },
  prBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(251,191,36,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prText: { fontSize: 11, fontWeight: "700", color: PR_COLOR },
  setAdder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  logButton: { marginLeft: 4 },
  logButtonText: { fontSize: 13, fontWeight: "700" },
  restRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  restText: { fontSize: 14, fontWeight: "600", color: WORKOUT, flex: 1 },
  skipText: { color: MUTED, fontSize: 13 },
  selectButton: { marginTop: 4 },
  selectButtonActive: { borderWidth: 1, borderColor: WORKOUT },
  selectButtonText: { color: MUTED },
});
