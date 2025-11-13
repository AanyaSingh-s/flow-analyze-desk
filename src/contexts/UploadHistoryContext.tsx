import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { EquipmentData } from "@/types/equipment";

type UploadRecord = {
  id: string;
  fileName: string;
  uploadedAt: string;
  rowCount: number;
  data: EquipmentData[];
};

type UploadHistoryContextValue = {
  history: UploadRecord[];
  paused: boolean;
  selectedId: string | null;
  selectedRecord: UploadRecord | null;
  recordUpload: (fileName: string, data: EquipmentData[]) => void;
  selectRecord: (id: string | null) => void;
  removeRecord: (id: string) => void;
  clearHistory: () => void;
  togglePause: () => void;
};

const STORAGE_KEY = "flow-analyze-history";

type StoredShape = {
  history: UploadRecord[];
  paused: boolean;
  selectedId: string | null;
};

const UploadHistoryContext = createContext<UploadHistoryContextValue | undefined>(undefined);

const readStoredHistory = (): StoredShape => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { history: [], paused: false, selectedId: null };
    }
    const parsed = JSON.parse(raw) as Partial<StoredShape>;
    return {
      history: parsed.history ?? [],
      paused: parsed.paused ?? false,
      selectedId: parsed.selectedId ?? null,
    };
  } catch (error) {
    console.warn("Failed to read upload history", error);
    return { history: [], paused: false, selectedId: null };
  }
};

const storeHistory = (shape: StoredShape) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shape));
  } catch (error) {
    console.warn("Failed to persist upload history", error);
  }
};

export const UploadHistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [{ history, paused, selectedId }, setState] = useState<StoredShape>(() => ({
    history: [],
    paused: false,
    selectedId: null,
  }));

  useEffect(() => {
    setState(readStoredHistory());
  }, []);

  useEffect(() => {
    storeHistory({ history, paused, selectedId });
  }, [history, paused, selectedId]);

  const generateId = useCallback(() => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `upload_${Math.random().toString(36).slice(2, 11)}`;
  }, []);

  const recordUpload = useCallback(
    (fileName: string, data: EquipmentData[]) => {
      setState((prev) => {
        if (prev.paused) {
          return prev;
        }
        const record: UploadRecord = {
          id: generateId(),
          fileName,
          uploadedAt: new Date().toISOString(),
          rowCount: data.length,
          data,
        };
        return {
          ...prev,
          history: [record, ...prev.history].slice(0, 50),
          selectedId: record.id,
        };
      });
    },
    [generateId],
  );

  const selectRecord = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedId: id,
    }));
  }, []);

  const removeRecord = useCallback((id: string) => {
    setState((prev) => {
      const nextHistory = prev.history.filter((item) => item.id !== id);
      return {
        ...prev,
        history: nextHistory,
        selectedId: prev.selectedId === id ? nextHistory[0]?.id ?? null : prev.selectedId,
      };
    });
  }, []);

  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      history: [],
      selectedId: null,
    }));
  }, []);

  const togglePause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      paused: !prev.paused,
    }));
  }, []);

  const selectedRecord = useMemo(() => history.find((item) => item.id === selectedId) ?? null, [history, selectedId]);

  const value = useMemo(
    () => ({
      history,
      paused,
      selectedId,
      selectedRecord,
      recordUpload,
      selectRecord,
      removeRecord,
      clearHistory,
      togglePause,
    }),
    [history, paused, selectedId, selectedRecord, recordUpload, selectRecord, removeRecord, clearHistory, togglePause],
  );

  return <UploadHistoryContext.Provider value={value}>{children}</UploadHistoryContext.Provider>;
};

export const useUploadHistory = () => {
  const context = useContext(UploadHistoryContext);
  if (!context) {
    throw new Error("useUploadHistory must be used within an UploadHistoryProvider");
  }
  return context;
};