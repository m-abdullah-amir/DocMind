"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Semester {
  id: string;
  name: string;
  isActive: boolean;
}

interface Subject {
  id: string;
  name: string;
  categories: string[];
}

type UploadMode = "smart" | "manual";

export default function SharePage() {
  const router = useRouter();

  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [fileType, setFileType] = useState<string>("application/octet-stream");

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploadMode, setUploadMode] = useState<UploadMode>("smart");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Read the pending shared file from Cache Storage
  useEffect(() => {
    async function readSharedFile() {
      try {
        if (!("caches" in window)) {
          setError("Your browser doesn't support the required APIs. Please use Chrome.");
          setLoading(false);
          return;
        }
        const cache = await caches.open("docmind-share-v1");
        const response = await cache.match("/pending-share");
        if (!response) {
          setError("No file was shared. Please go back and share a file to DocMind.");
          setLoading(false);
          return;
        }
        const name = decodeURIComponent(response.headers.get("X-File-Name") || "shared-file");
        const size = response.headers.get("X-File-Size") || "0";
        const type = response.headers.get("Content-Type") || "application/octet-stream";
        const blob = await response.blob();
        setFileName(name);
        setFileSize(size);
        setFileType(type);
        setFileBlob(blob);
      } catch (err) {
        setError("Failed to read the shared file.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    readSharedFile();
  }, []);

  // Fetch semesters
  useEffect(() => {
    async function fetchSemesters() {
      try {
        const res = await fetch("/api/semesters");
        const data = await res.json();
        if (data.semesters) {
          setSemesters(data.semesters);
          const active = data.semesters.find((s: Semester) => s.isActive);
          if (active) setSelectedSemesterId(active.id);
        }
      } catch {
        /* ignore */
      }
    }
    fetchSemesters();
  }, []);

  // Fetch subjects when semester changes
  useEffect(() => {
    if (!selectedSemesterId) return;
    async function fetchSubjects() {
      const res = await fetch(`/api/subjects?semesterId=${selectedSemesterId}`);
      const data = await res.json();
      if (data.subjects) {
        setSubjects(data.subjects);
        setSelectedSubjectId("");
        setSelectedCategory("");
      }
    }
    fetchSubjects();
  }, [selectedSemesterId]);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedSemester = semesters.find(s => s.id === selectedSemesterId);

  function formatSize(bytes: string) {
    const b = parseInt(bytes);
    if (isNaN(b)) return "";
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleUpload() {
    if (!fileBlob || !fileName) return;
    if (!selectedSemesterId || !selectedSubjectId) {
      setError("Please select a semester and subject.");
      return;
    }
    if (uploadMode === "manual" && !selectedCategory) {
      setError("Please select a category.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", new File([fileBlob], fileName, { type: fileType }));
    formData.append("semesterName", selectedSemester!.name);
    formData.append("subjectName", selectedSubject!.name);

    try {
      let res: Response;
      if (uploadMode === "smart") {
        res = await fetch("/api/smart-upload", { method: "POST", body: formData });
      } else {
        formData.append("category", selectedCategory);
        res = await fetch("/api/upload", { method: "POST", body: formData });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        // Clear the pending share from cache
        try {
          const cache = await caches.open("docmind-share-v1");
          await cache.delete("/pending-share");
        } catch { /* ignore */ }

        const msg = uploadMode === "smart"
          ? `✅ AI classified "${fileName}" as "${data.category}" and uploaded!`
          : `✅ "${fileName}" uploaded to ${selectedCategory}!`;
        setSuccess(msg);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">DocMind</h1>
          <p className="text-[#998f88] text-sm mt-1">Save to your workspace</p>
        </div>

        {loading ? (
          <div className="glass-panel p-8 text-center text-[#D9CBC2]/60">
            Reading file...
          </div>
        ) : error && !fileBlob ? (
          <div className="glass-panel p-6 text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-[#E0C58F] text-[#173450] rounded font-medium text-sm"
            >
              Go to Dashboard
            </button>
          </div>
        ) : success ? (
          <div className="glass-panel p-8 flex flex-col items-center text-center gap-4">
            <div className="text-5xl">🎉</div>
            <p className="text-green-300 text-sm">{success}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 bg-[#E0C58F] text-[#173450] rounded font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="glass-panel p-6 flex flex-col gap-5">
            {/* File Info */}
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
              <span className="text-3xl">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{fileName}</p>
                {fileSize && <p className="text-[#998f88] text-xs">{formatSize(fileSize)}</p>}
              </div>
            </div>

            {/* Upload Mode */}
            <div>
              <label className="block text-xs font-semibold text-[#998f88] uppercase tracking-wider mb-2">Upload Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setUploadMode("smart")}
                  className={`py-2.5 rounded text-sm font-medium transition-colors ${
                    uploadMode === "smart"
                      ? "bg-[#E0C58F] text-[#173450]"
                      : "bg-white/5 text-[#D9CBC2] hover:bg-white/10"
                  }`}
                >
                  🤖 AI Smart
                </button>
                <button
                  onClick={() => setUploadMode("manual")}
                  className={`py-2.5 rounded text-sm font-medium transition-colors ${
                    uploadMode === "manual"
                      ? "bg-[#E0C58F] text-[#173450]"
                      : "bg-white/5 text-[#D9CBC2] hover:bg-white/10"
                  }`}
                >
                  📂 Manual
                </button>
              </div>
              {uploadMode === "smart" && (
                <p className="text-xs text-[#998f88] mt-2">AI will automatically decide the category (Course Data, Assignments, or Quizzes).</p>
              )}
            </div>

            {/* Semester Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#998f88] uppercase tracking-wider mb-2">Semester</label>
              <select
                value={selectedSemesterId}
                onChange={e => setSelectedSemesterId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#E0C58F] [color-scheme:dark]"
              >
                <option value="">Select semester...</option>
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Subject Picker */}
            {selectedSemesterId && (
              <div>
                <label className="block text-xs font-semibold text-[#998f88] uppercase tracking-wider mb-2">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#E0C58F] [color-scheme:dark]"
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Picker — only for manual mode */}
            {uploadMode === "manual" && selectedSubjectId && selectedSubject && (
              <div>
                <label className="block text-xs font-semibold text-[#998f88] uppercase tracking-wider mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Course Data", "Assignments", "Quizzes"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`py-2 px-1 rounded text-xs font-medium transition-colors text-center ${
                        selectedCategory === cat
                          ? "bg-[#E0C58F] text-[#173450]"
                          : "bg-white/5 text-[#D9CBC2] hover:bg-white/10"
                      }`}
                    >
                      {cat === "Course Data" && "📚 "}
                      {cat === "Assignments" && "📝 "}
                      {cat === "Quizzes" && "📋 "}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-red-400 text-xs bg-red-900/20 border border-red-500/20 rounded p-2">{error}</p>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedSemesterId || !selectedSubjectId || (uploadMode === "manual" && !selectedCategory)}
              className="w-full py-3.5 bg-[#E0C58F] text-[#173450] rounded font-semibold text-sm hover:bg-[#dec38d] disabled:opacity-40 transition-colors"
            >
              {uploading ? "Uploading..." : "Upload to DocMind"}
            </button>

            {/* Cancel */}
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-2 text-[#998f88] text-sm hover:text-[#D9CBC2] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
