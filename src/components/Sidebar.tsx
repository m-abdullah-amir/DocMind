"use client";

import { useState, useEffect } from "react";
import { Semester } from "@/lib/semesters";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const res = await fetch("/api/semesters");
      const data = await res.json();
      if (data.semesters) {
        setSemesters(data.semesters);
      }
    } catch (error) {
      console.error("Failed to load semesters", error);
    }
  };

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSemesterName, startDate, endDate })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewSemesterName("");
        setStartDate("");
        setEndDate("");
        await fetchSemesters();
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create semester", error);
    } finally {
      setLoading(false);
    }
  };

  const activateSemester = async (id: string) => {
    try {
      const res = await fetch("/api/semesters/activate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semesterId: id })
      });
      if (res.ok) {
        await fetchSemesters();
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to activate semester", error);
    }
  };

  return (
    <>
      <aside className="w-64 glass-panel border-r border-white/10 m-4 flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white tracking-wide">DocMind</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-semibold tracking-wider text-[#998f88] uppercase">Semesters</div>
            <button onClick={() => setIsModalOpen(true)} className="text-[#E0C58F] text-xl leading-none hover:text-white transition-colors">+</button>
          </div>
          
          {semesters.length === 0 ? (
            <div className="text-sm text-[#D9CBC2]/50 italic">No semesters yet.</div>
          ) : (
            semesters.map(sem => (
              <div 
                key={sem.id}
                onClick={() => !sem.isActive && activateSemester(sem.id)}
                className={`p-2 rounded cursor-pointer transition-colors ${sem.isActive ? 'bg-white/10 text-[#E0C58F] font-medium' : 'text-[#D9CBC2] hover:bg-white/5'}`}
              >
                {sem.name}
              </div>
            ))
          )}
        </nav>
      </aside>

      {/* Create Semester Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-8 w-[400px]">
            <h3 className="text-xl text-white mb-6">Create New Semester</h3>
            <form onSubmit={handleCreateSemester} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-[#D9CBC2] mb-1">Semester Name</label>
                <input required type="text" value={newSemesterName} onChange={e => setNewSemesterName(e.target.value)} placeholder="e.g. Fall 2024" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#E0C58F]" />
              </div>
              <div>
                <label className="block text-sm text-[#D9CBC2] mb-1">Start Date</label>
                <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#E0C58F]" />
              </div>
              <div>
                <label className="block text-sm text-[#D9CBC2] mb-1">End Date</label>
                <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#E0C58F]" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[#D9CBC2] hover:text-white">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#E0C58F] text-[#173450] rounded font-medium hover:bg-[#dec38d] disabled:opacity-50">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
