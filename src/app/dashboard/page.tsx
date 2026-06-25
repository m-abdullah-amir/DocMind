"use client";

import { useState, useEffect } from "react";
import { Subject } from "@/lib/subjects";
import { SubjectCard, CreateSubjectCard } from "@/components/SubjectCard";
import { useSemesters } from "@/components/SemesterContext";

export default function DashboardPage() {
  const { activeSemester, loading: semesterLoading } = useSemesters();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  useEffect(() => {
    if (activeSemester) {
      fetchSubjects(activeSemester.id);
    } else {
      setSubjects([]);
    }
  }, [activeSemester?.id]);

  const fetchSubjects = async (semesterId: string) => {
    setSubjectsLoading(true);
    try {
      const res = await fetch(`/api/subjects?semesterId=${semesterId}`);
      const data = await res.json();
      if (data.subjects) {
        setSubjects(data.subjects);
      }
    } catch (err) {
      console.error("Failed to load subjects", err);
    } finally {
      setSubjectsLoading(false);
    }
  };

  // Show spinner while semesters are first loading
  if (semesterLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#D9CBC2]/50 text-sm">Loading your workspace...</div>
      </div>
    );
  }

  if (!activeSemester) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="glass-panel p-6 sm:p-10 text-center max-w-md w-full">
          <div className="text-4xl mb-4">🎓</div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Welcome to DocMind</h2>
          <p className="text-sm sm:text-base text-[#D9CBC2]">
            Create your first semester using the <span className="text-[#E0C58F] font-bold">+</span> button in the sidebar to get started.
          </p>
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

      {subjectsLoading ? (
        <div className="text-[#D9CBC2]/50 text-sm">Loading subjects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subj => (
            <SubjectCard key={subj.id} subject={subj} semesterName={activeSemester.name} />
          ))}
          <CreateSubjectCard
            semesterId={activeSemester.id}
            onCreated={() => fetchSubjects(activeSemester.id)}
          />
        </div>
      )}
    </div>
  );
}
