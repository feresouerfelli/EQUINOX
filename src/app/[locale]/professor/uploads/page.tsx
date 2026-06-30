"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileText, CheckCircle, Loader2, X, Video, Image, File } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";

interface UploadedFile {
  name: string;
  path: string;
  type: string;
  size: string;
  uploaded_at: number | string;
}

const typeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  MP4: Video,
  WEBM: Video,
  MOV: Video,
  JPG: Image,
  JPEG: Image,
  PNG: Image,
  WEBP: Image,
};

const typeColors: Record<string, string> = {
  PDF: "text-red-400",
  MP4: "text-blue-400",
  WEBM: "text-blue-400",
  MOV: "text-blue-400",
  JPG: "text-green-400",
  JPEG: "text-green-400",
  PNG: "text-green-400",
  WEBP: "text-green-400",
};

export default function ProfessorUploadsPage() {
  const t = useTranslations("professor.uploads");
  const token = useAuthStore((s) => s.token);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    api.get<UploadedFile[]>("/upload/professor-files", token)
      .then(setFiles)
      .catch(() => {});
  }, [token]);

  const handleFile = async (file: File) => {
    if (!token) return;

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      alert("File too large. Max 500MB.");
      return;
    }

    setUploading(true);
    setProgress(0);

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.floor(Math.random() * 10) + 5, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await api.upload<{ name: string; path: string; type: string; size: string; uploaded_at: string }>(
        "/upload/professor-file",
        formData,
        token
      );

      clearInterval(progressInterval);
      setProgress(100);

      setFiles((prev) => [result, ...prev]);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setUploading(false);
        setProgress(0);
      }, 2000);
    } catch (err) {
      clearInterval(progressInterval);
      setUploading(false);
      setProgress(0);
      alert("Upload failed. Please try again.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const formatDate = (ts: number | string) => {
    if (typeof ts === "string") return ts;
    return new Date(ts * 1000).toISOString().split("T")[0];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#E8F5E0]">{t("title")}</h2>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.mp4,.webm,.mov,.jpg,.jpeg,.png,.webp"
        onChange={handleChange}
      />

      <div
        className={`dash-card-flat cursor-pointer border-2 border-dashed transition-all fade-up ${
          dragOver
            ? "border-[#C9A84C] bg-[#C9A84C]/5"
            : uploadSuccess
            ? "border-[#34D399]"
            : "border-[rgba(255,255,255,0.07)] hover:border-[#C9A84C]"
        }`}
        onClick={!uploading ? handleClick : undefined}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="py-8 text-center">
            <Loader2 size={32} className="mx-auto mb-3 animate-spin text-[#0A6B4A]" />
            <p className="text-sm text-[#E8F5E0]">{t("uploading")} {progress}%</p>
            <div className="mx-auto mt-3 h-2 w-48 rounded-full bg-[rgba(255,255,255,0.07)]">
              <div className="h-full rounded-full bg-[#0A6B4A] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : uploadSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle size={32} className="mx-auto mb-3 text-[#34D399]" />
            <p className="text-sm text-[#34D399]">{t("uploaded")}</p>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Upload size={32} className="mx-auto mb-3 text-[#4D7A60]" />
            <p className="text-sm text-[#9DBFAA]">{t("dragOrClick")}</p>
            <p className="mt-1 text-xs text-[#4D7A60]">PDF, Video (MP4/WebM), Images — Max 500MB</p>
          </div>
        )}
      </div>

      <div className="dash-card-flat fade-up stagger-2">
        <h3 className="mb-4 text-sm font-semibold text-[#E8F5E0]">{t("filesUploaded")} ({files.length})</h3>
        {files.length === 0 ? (
          <p className="text-sm text-[#4D7A60] text-center py-6">No files uploaded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("file")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("type")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("size")}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#4D7A60]">{t("date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
                {files.map((f, i) => {
                  const Icon = typeIcons[f.type] || File;
                  const color = typeColors[f.type] || "text-[#4D7A60]";
                  return (
                    <tr key={i} className="hover:bg-[rgba(255,255,255,0.02)]">
                      <td className="px-4 py-3 flex items-center gap-2 text-[#E8F5E0]">
                        <Icon size={14} className={color} /> {f.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-grey">{f.type}</span>
                      </td>
                      <td className="px-4 py-3 text-[#9DBFAA]">{f.size}</td>
                      <td className="px-4 py-3 text-[#4D7A60]">{formatDate(f.uploaded_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
