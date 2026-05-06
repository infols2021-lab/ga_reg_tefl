'use client';

import { useEffect, useRef, useState } from 'react';
import LoadingOverlay from '@/components/ui/loading-overlay';

type UploadedFileItem = {
  id: string;
  name: string;
  originalName: string | null;
  size: number | null;
  url: string | null;
};

type FileUploadProps = {
  applicationId: string | null;
  onUploaded?: () => void;
  onFilesChange?: (count: number) => void;
};

export default function FileUpload({
  applicationId,
  onUploaded,
  onFilesChange,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  function openFileDialog() {
    inputRef.current?.click();
  }

  async function loadUploadedFiles(currentApplicationId: string) {
    try {
      setIsLoadingFiles(true);
      const res = await fetch(
        `/api/applications/teachers/upload?applicationId=${encodeURIComponent(currentApplicationId)}`,
        { method: 'GET', cache: 'no-store' }
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || 'Не удалось загрузить список файлов');
      }
      const nextFiles = Array.isArray(json?.data?.files) ? json.data.files : [];
      setUploadedFiles(nextFiles);
      onFilesChange?.(nextFiles.length);
    } catch (e: any) {
      alert(e.message || 'Не удалось загрузить список файлов');
    } finally {
      setIsLoadingFiles(false);
    }
  }

  useEffect(() => {
    if (!applicationId) {
      setUploadedFiles([]);
      onFilesChange?.(0);
      return;
    }
    loadUploadedFiles(applicationId);
  }, [applicationId]);

  async function uploadSelectedFiles(selectedFiles: File[]) {
    if (!applicationId) {
      alert('Сначала создай заявку');
      return;
    }
    if (!selectedFiles.length) return;

    try {
      setIsUploading(true);
      setPendingFiles(selectedFiles);

      const formData = new FormData();
      formData.append('applicationId', applicationId);
      selectedFiles.forEach((file) => formData.append('files', file));

      const res = await fetch('/api/applications/teachers/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || 'Ошибка загрузки');
      }

      const newlyUploaded = Array.isArray(json?.data?.uploaded) ? json.data.uploaded : [];
      const nextFiles = [...uploadedFiles, ...newlyUploaded];
      setUploadedFiles(nextFiles);
      onFilesChange?.(nextFiles.length);
      onUploaded?.();
      setPendingFiles([]);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []) as File[];
    await uploadSelectedFiles(selected);
  }

  async function removeUploadedFile(fileId: string) {
    if (!applicationId) {
      alert('Нет applicationId');
      return;
    }
    try {
      setDeletingFileId(fileId);
      const res = await fetch('/api/applications/teachers/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, fileId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || 'Не удалось удалить файл');
      }
      const nextFiles = uploadedFiles.filter((file) => file.id !== fileId);
      setUploadedFiles(nextFiles);
      onFilesChange?.(nextFiles.length);
    } catch (e: any) {
      alert(e.message || 'Не удалось удалить файл');
    } finally {
      setDeletingFileId(null);
    }
  }

  return (
    <div className="space-y-4">
      {(isUploading || isLoadingFiles) && (
        <LoadingOverlay text={isUploading ? 'Загрузка...' : 'Загрузка файлов...'} />
      )}
      <input ref={inputRef} type="file" multiple hidden onChange={handleSelect} />
      <button type="button" onClick={openFileDialog} className="rounded-xl bg-black px-5 py-3 text-white">
        Выбрать файл
      </button>

      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          {pendingFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded bg-slate-100 px-3 py-2 text-sm">
              <span className="truncate">{file.name}</span>
              <span className="text-slate-500">загружается...</span>
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between gap-3 rounded bg-slate-100 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1">
                {file.url ? (
                  <a href={file.url} target="_blank" rel="noreferrer" className="block truncate text-slate-900 underline underline-offset-2">
                    {file.name}
                  </a>
                ) : (
                  <span className="block truncate text-slate-900">{file.name}</span>
                )}
                {file.originalName && file.originalName !== file.name ? (
                  <div className="truncate text-xs text-slate-500">исходный файл: {file.originalName}</div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeUploadedFile(file.id)}
                disabled={deletingFileId === file.id}
                className="shrink-0 text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingFileId === file.id ? 'удаление...' : 'удалить'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}