import { eq } from "drizzle-orm";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import type { SplitExport } from "../types";

export const useSplits = () => {
  const [rows, setRows] = useState<SplitExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const db = getDb();
      const allRows = await db.select().from(schema.splits);
      const active = allRows.find((r) => r.isActive);
      setRows(
        allRows.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description ?? "",
          isActive: r.isActive ?? false,
          schedule: r.schedule,
        })),
      );
      setActiveId(active?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Activates one split and deactivates the rest (exactly one is active). */
  const activateSplit = useCallback(
    async (id: string) => {
      const db = getDb();
      const now = new Date();
      await db
        .update(schema.splits)
        .set({ isActive: false, updatedAt: now })
        .where(eq(schema.splits.isActive, true))
        .run();
      await db
        .update(schema.splits)
        .set({ isActive: true, updatedAt: now })
        .where(eq(schema.splits.id, id))
        .run();
      await load();
    },
    [load],
  );

  const active = useMemo(
    () => rows.find((r) => r.id === activeId) ?? null,
    [rows, activeId],
  );

  return { splits: rows, active, loading, activateSplit, refetch: load };
};
