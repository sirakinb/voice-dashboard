"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useDemoMode } from "./demo-context";
import { demoCanvasCharts, demoCanvasDrafts } from "./demo-data";

export type ChartDataPoint = {
  label: string;
  value: number;
  color?: string;
};

export type CanvasChart = {
  id: string;
  type: "bar" | "line" | "pie" | "area";
  title: string;
  data: ChartDataPoint[];
  createdAt: Date;
};

export type CanvasDraft = {
  id: string;
  type: "summary" | "report" | "analysis" | "list";
  title: string;
  content: string;
  createdAt: Date;
};

export type CanvasItem =
  | { kind: "chart"; item: CanvasChart }
  | { kind: "draft"; item: CanvasDraft };

type CanvasContextType = {
  items: CanvasItem[];
  addChart: (chart: Omit<CanvasChart, "id" | "createdAt">) => void;
  addDraft: (draft: Omit<CanvasDraft, "id" | "createdAt">) => void;
  removeItem: (id: string) => void;
  clearCanvas: () => void;
};

const CanvasContext = createContext<CanvasContextType | null>(null);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isDemoMode } = useDemoMode();

  // Initialize with demo data if in demo mode
  useEffect(() => {
    if (!isInitialized) {
      if (isDemoMode) {
        const demoItems: CanvasItem[] = [
          ...demoCanvasCharts.map((chart) => ({ kind: "chart" as const, item: chart })),
          ...demoCanvasDrafts.map((draft) => ({ kind: "draft" as const, item: draft })),
        ];
        setItems(demoItems);
      }
      setIsInitialized(true);
    }
  }, [isDemoMode, isInitialized]);

  // Clear canvas when toggling out of demo mode
  useEffect(() => {
    if (isInitialized && !isDemoMode) {
      setItems([]);
    } else if (isInitialized && isDemoMode) {
      const demoItems: CanvasItem[] = [
        ...demoCanvasCharts.map((chart) => ({ kind: "chart" as const, item: chart })),
        ...demoCanvasDrafts.map((draft) => ({ kind: "draft" as const, item: draft })),
      ];
      setItems(demoItems);
    }
  }, [isDemoMode, isInitialized]);

  const addChart = (chart: Omit<CanvasChart, "id" | "createdAt">) => {
    const newChart: CanvasChart = {
      ...chart,
      id: `chart-${Date.now()}`,
      createdAt: new Date(),
    };
    setItems((prev) => [{ kind: "chart", item: newChart }, ...prev]);
  };

  const addDraft = (draft: Omit<CanvasDraft, "id" | "createdAt">) => {
    const newDraft: CanvasDraft = {
      ...draft,
      id: `draft-${Date.now()}`,
      createdAt: new Date(),
    };
    setItems((prev) => [{ kind: "draft", item: newDraft }, ...prev]);
  };

  const removeItem = (id: string) => {
    setItems((prev) =>
      prev.filter((item) =>
        item.kind === "chart" ? item.item.id !== id : item.item.id !== id
      )
    );
  };

  const clearCanvas = () => {
    setItems([]);
  };

  return (
    <CanvasContext.Provider
      value={{ items, addChart, addDraft, removeItem, clearCanvas }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
}

