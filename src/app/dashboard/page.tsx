"use client";

import { useState, useEffect } from "react";
import { Subject } from "@/lib/subjects";
import { Semester } from "@/lib/semesters";
import { SubjectCard, CreateSubjectCard } from "@/components/SubjectCard";

export default function DashboardPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const activeSemester = semesters.find(s => s.isActive);

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (activeSemester) {
      fetchSubjects(activeSemester.id);
    } else {
      setSubjects([]);
      setLoading(false);
    }
  }, [activeSemester?.id]);

  const fetchSemesters = async () => {
    try {
      const res = await fetch("/api/semesters");
      const data = await res.json();
      if (data.semesters) {
        setSemesters(data.semesters);
      }
    } catch (err) {
      console.error("Failed to load semesters", err);
    }
  };

  const fetchSubjects = async (semesterId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subjects?semesterId=${semesterId}`);
      const data = await res.json();
      if (data.subjects) {
        setSubjects(data.subjects);
      }
    } catch (err) {
      console.error("Failed to load subjects", err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeSemester) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="glass-panel p-6 sm:p-10 text-center max-w-md w-full">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Welcome to DocMind</h2>
          <p className="text-sm sm:text-base text-[#D9CBC2] mb-2">Create your first semester using the <span className="text-[#E0C58F]">+</span> button in the sidebar to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-white">{activeSemester.name}</h1>
      <p className="text-[#998f88] mb-8 text-sm">
        {new Date(activeSemester.startDate).toLocaleDateString()} — {new Date(activeSemester.endDate).toLocaleDateString()}
      </p>

      {loading ? (
        <div className="text-[#D9CBC2]/50">Loading subjects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subj => (
            <SubjectCard key={subj.id} subject={subj} semesterName={activeSemester.name} />
          ))}
          <CreateSubjectCard semesterId={activeSemester.id} onCreated={() => fetchSubjects(activeSemester.id)} />
        </div>
      )}
    </div>
  );
}
