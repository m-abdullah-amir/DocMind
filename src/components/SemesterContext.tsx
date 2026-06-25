"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Semester } from "@/lib/semesters";

interface SemesterContextType {
  semesters: Semester[];
  activeSemester: Semester | undefined;
  loading: boolean;
  fetchSemesters: () => Promise<void>;
  activateSemester: (id: string) => Promise<void>;
  createSemester: (name: string, startDate: string, endDate: string) => Promise<boolean>;
}

const SemesterContext = createContext<SemesterContextType | null>(null);

export function SemesterProvider({ children }: { children: ReactNode }) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSemesters = useCallback(async () => {
    try {
      const res = await fetch("/api/semesters");
      const data = await res.json();
      if (data.semesters) {
        setSemesters(data.semesters);
      }
    } catch (err) {
      console.error("Failed to load semesters", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  const activateSemester = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/semesters/activate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semesterId: id }),
      });
      if (res.ok) {
        // Immediately update local state for instant UI response
        setSemesters(prev =>
          prev.map(s => ({ ...s, isActive: s.id === id }))
        );
      }
    } catch (err) {
      console.error("Failed to activate semester", err);
    }
  }, []);

  const createSemester = useCallback(async (
    name: string,
    startDate: string,
    endDate: string
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, startDate, endDate }),
      });
      if (res.ok) {
        await fetchSemesters();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to create semester", err);
      return false;
    }
  }, [fetchSemesters]);

  const activeSemester = semesters.find(s => s.isActive);

  return (
    <SemesterContext.Provider value={{
      semesters,
      activeSemester,
      loading,
      fetchSemesters,
      activateSemester,
      createSemester,
    }}>
      {children}
    </SemesterContext.Provider>
  );
}

export function useSemesters() {
  const ctx = useContext(SemesterContext);
  if (!ctx) throw new Error("useSemesters must be used within SemesterProvider");
  return ctx;
}
