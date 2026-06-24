"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType === "application/pdf") return "📄";
  if (mimeType?.includes("word") || mimeType?.includes("document")) return "📝";
  if (mimeType?.includes("sheet") || mimeType?.includes("excel")) return "📊";
  if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint")) return "📽️";
  if (mimeType?.includes("image")) return "🖼️";
  return "📎";
}

function formatFileSize(bytes: string) {
  const b = parseInt(bytes);
  if (isNaN(b)) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FolderViewPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const category = decodeURIComponent(params.category as string);

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // We need to fetch subject and semester names for the breadcrumb and API calls
  const [subjectName, setSubjectName] = useState("");
  const [semesterName, setSemesterName] = useState("");

  useEffect(() => {
    fetchContext();
  }, [subjectId]);

  const fetchContext = async () => {
    try {
      // Get semesters
      const semRes = await fetch("/api/semesters");
      const semData = await semRes.json();
      const activeSemester = semData.semesters?.find((s: any) => s.isActive);
      if (activeSemester) {
        setSemesterName(activeSemester.name);

        // Get subjects for this semester
        const subjRes = await fetch(`/api/subjects?semesterId=${activeSemester.id}`);
        const subjData = await subjRes.json();
        const subject = subjData.subjects?.find((s: any) => s.id === subjectId);
        if (subject) {
          setSubjectName(subject.name);
        }
      }
    } catch (err) {
      console.error("Failed to fetch context", err);
    }
  };

  const fetchFiles = useCallback(async () => {
    if (!semesterName || !subjectName) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ semesterName, subjectName, category });
      const res = await fetch(`/api/files?${params.toString()}`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error("Failed to load files", err);
    } finally {
      setLoading(false);
    }
  }, [semesterName, subjectName, category]);

  useEffect(() => {
    if (semesterName && subjectName) {
      fetchFiles();
    }
  }, [semesterName, subjectName, fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size validation
    if (file.size > MAX_FILE_SIZE) {
      setError("File exceeds 10MB limit.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("semesterName", semesterName);
    formData.append("subjectName", subjectName);
    formData.append("category", category);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setSuccess(`"${file.name}" uploaded successfully!`);
        await fetchFiles();
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = "";
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#998f88] mb-6">
        <Link href="/dashboard" className="hover:text-[#D9CBC2] transition-colors">DocMind</Link>
        <span>/</span>
        <span className="text-[#D9CBC2]">{semesterName || "..."}</span>
        <span>/</span>
        <Link href="/dashboard" className="hover:text-[#D9CBC2] transition-colors">{subjectName || "..."}</Link>
        <span>/</span>
        <span className="text-[#E0C58F]">{category}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-white">{category}</h1>
        <label className="px-5 py-2.5 bg-[#E0C58F] text-[#173450] rounded font-medium hover:bg-[#dec38d] transition-colors cursor-pointer disabled:opacity-50">
          {uploading ? "Uploading..." : "Upload File"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg" />
        </label>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded text-green-300 text-sm">
          {success}
        </div>
      )}

      {/* File List */}
      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#D9CBC2]/50">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-[#D9CBC2]/50">
            No files yet. Upload your first document!
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_120px_100px] gap-4 px-6 py-3 border-b border-white/10 text-xs font-semibold tracking-wider text-[#998f88] uppercase">
              <div className="w-8"></div>
              <div>Filename</div>
              <div>Date</div>
              <div>Size</div>
            </div>
            {/* File Rows */}
            {files.map(file => (
              <div key={file.id} className="grid grid-cols-[auto_1fr_120px_100px] gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center">
                <div className="text-xl w-8">{getFileIcon(file.mimeType)}</div>
                <div className="text-[#D9CBC2] truncate">{file.name}</div>
                <div className="text-sm text-[#998f88]">{new Date(file.createdTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                <div className="text-sm text-[#998f88]">{formatFileSize(file.size)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
