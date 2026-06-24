"use client";

import { useState } from "react";
import { Subject } from "@/lib/subjects";
import Link from "next/link";

interface SubjectCardProps {
  subject: Subject;
}

export function SubjectCard({ subject, semesterName }: SubjectCardProps & { semesterName: string }) {
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSmartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setNotification({ type: "error", message: "File exceeds 10MB limit." });
      return;
    }

    setUploading(true);
    setNotification(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("semesterName", semesterName);
    formData.append("subjectName", subject.name);

    try {
      const res = await fetch("/api/smart-upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setNotification({ type: "error", message: data.error || "Upload failed" });
      } else {
        setNotification({ type: "success", message: data.message });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch {
      setNotification({ type: "error", message: "Upload failed." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="glass-panel p-6 group hover:bg-white/[0.08] transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-medium text-white">{subject.name}</h3>
        <label className={`text-xs px-3 py-1.5 rounded cursor-pointer transition-colors ${uploading ? 'bg-white/10 text-[#998f88]' : 'bg-[#E0C58F]/20 text-[#E0C58F] hover:bg-[#E0C58F]/30'}`}>
          {uploading ? "Classifying..." : "🤖 Smart Upload"}
          <input type="file" className="hidden" onChange={handleSmartUpload} disabled={uploading} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" />
        </label>
      </div>
      {notification && (
        <div className={`mb-3 p-2 rounded text-xs ${notification.type === "success" ? "bg-green-900/30 text-green-300 border border-green-500/20" : "bg-red-900/30 text-red-300 border border-red-500/20"}`}>
          {notification.message}
        </div>
      )}
      <div className="space-y-2">
        {subject.categories.map(category => (
          <Link
            key={category}
            href={`/dashboard/subject/${subject.id}/${encodeURIComponent(category)}`}
            className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors text-[#D9CBC2] hover:text-[#E0C58F]"
          >
            <span className="text-lg">
              {category === "Course Data" && "📚"}
              {category === "Assignments" && "📝"}
              {category === "Quizzes" && "📋"}
            </span>
            <span>{category}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface CreateSubjectCardProps {
  semesterId: string;
  onCreated: () => void;
}

export function CreateSubjectCard({ semesterId, onCreated }: CreateSubjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), semesterId }),
      });
      if (res.ok) {
        setName("");
        setIsEditing(false);
        onCreated();
      }
    } catch (err) {
      console.error("Failed to create subject", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="glass-panel p-6 flex flex-col items-center justify-center gap-3 min-h-[180px] border-2 border-dashed border-white/10 hover:border-[#E0C58F]/40 transition-all duration-300 cursor-pointer group"
      >
        <span className="text-4xl text-[#E0C58F]/60 group-hover:text-[#E0C58F] transition-colors">+</span>
        <span className="text-[#D9CBC2]/60 group-hover:text-[#D9CBC2] transition-colors">Add Subject</span>
      </button>
    );
  }

  return (
    <div className="glass-panel p-6">
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <h3 className="text-lg font-medium text-white">New Subject</h3>
        <input
          autoFocus
          required
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Data Structures"
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#E0C58F] transition-colors"
        />
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => { setIsEditing(false); setName(""); }} className="px-3 py-1.5 text-sm text-[#D9CBC2] hover:text-white transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-1.5 text-sm bg-[#E0C58F] text-[#173450] rounded font-medium hover:bg-[#dec38d] disabled:opacity-50 transition-colors">Create</button>
        </div>
      </form>
    </div>
  );
}
