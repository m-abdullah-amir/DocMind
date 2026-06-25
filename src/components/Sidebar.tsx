"use client";

import { useState, useEffect } from "react";
import { useSemesters } from "@/components/SemesterContext";

export function Sidebar() {
  const { semesters, activateSemester, createSemester } = useSemesters();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemesterName.trim() || !startDate || !endDate) return;
    setSubmitting(true);
    const ok = await createSemester(newSemesterName.trim(), startDate, endDate);
    setSubmitting(false);
    if (ok) {
      setIsModalOpen(false);
      setNewSemesterName("");
      setStartDate("");
      setEndDate("");
      setMobileOpen(false);
    }
  };

  const handleActivate = async (id: string, isActive: boolean) => {
    if (isActive) return; // already active
    await activateSemester(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white tracking-wide">DocMind</h2>
        {/* Close button only on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-[#D9CBC2] hover:text-white text-2xl leading-none"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-semibold tracking-wider text-[#998f88] uppercase">Semesters</div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[#E0C58F] text-xl leading-none hover:text-white transition-colors w-8 h-8 flex items-center justify-center"
          >
            +
          </button>
        </div>

        {semesters.length === 0 ? (
          <div className="text-sm text-[#D9CBC2]/50 italic">No semesters yet.</div>
        ) : (
          semesters.map(sem => (
            <div
              key={sem.id}
              onClick={() => handleActivate(sem.id, sem.isActive)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                sem.isActive
                  ? "bg-white/10 text-[#E0C58F] font-medium"
                  : "text-[#D9CBC2] hover:bg-white/5"
              }`}
            >
              {sem.name}
            </div>
          ))
        )}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-5 left-4 z-40 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-white"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Desktop Sidebar — always visible on md+ */}
      <aside className="hidden md:flex w-64 glass-panel border-r border-white/10 m-4 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Slide-in panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a1e33] border-r border-white/10 flex flex-col animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Create Semester Modal — rendered at top level, always above everything */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 sm:p-8 w-full max-w-[400px]">
            <h3 className="text-xl text-white mb-6">Create New Semester</h3>
            <form onSubmit={handleCreateSemester} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-[#D9CBC2] mb-1">Semester Name</label>
                <input
                  required
                  autoFocus
                  type="text"
                  value={newSemesterName}
                  onChange={e => setNewSemesterName(e.target.value)}
                  placeholder="e.g. Fall 2024"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#E0C58F]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#D9CBC2] mb-1">Start Date</label>
                <input
                  required
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#E0C58F] [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#D9CBC2] mb-1">End Date</label>
                <input
                  required
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#E0C58F] [color-scheme:dark]"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setNewSemesterName(""); setStartDate(""); setEndDate(""); }}
                  className="px-4 py-2 text-[#D9CBC2] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#E0C58F] text-[#173450] rounded font-medium hover:bg-[#dec38d] disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
