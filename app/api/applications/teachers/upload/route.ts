import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createApplicationFolder, uploadFileToDrive } from '@/lib/google/drive';

export const runtime = 'nodejs';

function jsonError(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

function sanitizeFileNamePart(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').replace(/\.+$/g, '');
}

function formatDateForFileName(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return sanitizeFileNamePart(trimmed);
  return date.toISOString().slice(0, 10);
}

function getFileExtension(fileName: string, mimeType?: string | null): string {
  const trimmedName = fileName.trim();
  const dotIndex = trimmedName.lastIndexOf('.');
  if (dotIndex > -1 && dotIndex < trimmedName.length - 1) {
    return trimmedName.slice(dotIndex);
  }
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
  };
  return mimeToExt[mimeType || ''] || '';
}

function buildUploadedFileName(params: {
  firstName?: string | null;
  surname?: string | null;
  dateOfBirth?: string | null;
  originalFileName: string;
  mimeType?: string | null;
}): string {
  const firstName = sanitizeFileNamePart(params.firstName);
  const surname = sanitizeFileNamePart(params.surname);
  const dateOfBirth = formatDateForFileName(params.dateOfBirth);
  const baseName = [firstName, surname, dateOfBirth].filter(Boolean).join(' ');
  const extension = getFileExtension(params.originalFileName, params.mimeType);
  return baseName ? `${baseName}${extension}` : `${Date.now()}${extension}`;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const applicationId = url.searchParams.get('applicationId');
    if (!applicationId) {
      return jsonError(400, 'APPLICATION_ID_REQUIRED', 'Не передан applicationId.');
    }

    const supabase = createServerSupabaseClient();
    const { data: files, error } = await supabase
      .from('application_files')
      .select('id, normalized_file_name, original_file_name, file_size_bytes, drive_web_view_link, created_at')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET upload files error:', error);
      return jsonError(500, 'FILES_LOAD_FAILED', 'Не удалось загрузить список файлов.');
    }

    return Response.json({
      ok: true,
      data: {
        files: (files || []).map((file) => ({
          id: file.id,
          name: file.normalized_file_name || file.original_file_name,
          originalName: file.original_file_name || null,
          size: file.file_size_bytes ?? null,
          url: file.drive_web_view_link ?? null,
        })),
      },
    });
  } catch (err) {
    console.error('GET /upload ERROR:', err);
    return jsonError(500, 'FILES_LOAD_FAILED', err instanceof Error ? err.message : 'Не удалось загрузить список файлов.');
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const applicationId = formData.get('applicationId')?.toString();
    if (!applicationId) {
      return jsonError(400, 'APPLICATION_ID_REQUIRED', 'Не передан applicationId.');
    }

    const files = formData.getAll('files') as File[];
    if (!files.length) {
      return jsonError(400, 'FILES_REQUIRED', 'Не выбраны файлы.');
    }

    const supabase = createServerSupabaseClient();

    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('id, public_id')
      .eq('id', applicationId)
      .single();

    if (appError || !app) {
      return jsonError(404, 'APPLICATION_NOT_FOUND', 'Заявка не найдена.');
    }

    const { data: details, error: detailsError } = await supabase
      .from('teacher_application_details')
      .select('first_name, surname, date_of_birth')
      .eq('application_id', applicationId)
      .single();

    if (detailsError || !details) {
      return jsonError(404, 'APPLICATION_DETAILS_NOT_FOUND', 'Детали заявки не найдены.');
    }

    const { folderId } = await createApplicationFolder();

    const results = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const finalFileName = buildUploadedFileName({
        firstName: details.first_name,
        surname: details.surname,
        dateOfBirth: details.date_of_birth,
        originalFileName: file.name,
        mimeType: file.type,
      });

      const upload = await uploadFileToDrive({
        buffer,
        fileName: finalFileName,
        mimeType: file.type,
        folderId,
      });

      const { data: insertedFile, error: dbError } = await supabase
        .from('application_files')
        .insert({
          application_id: app.id,
          category: 'other',
          original_file_name: file.name,
          mime_type: file.type,
          file_size_bytes: file.size,
          upload_status: 'uploaded',
          storage_provider: 'google_drive',
          drive_folder_id: folderId,
          drive_file_id: upload.fileId,
          drive_web_view_link: upload.webViewLink,
          drive_download_link: upload.downloadLink,
          normalized_file_name: finalFileName,
        })
        .select('id, normalized_file_name, original_file_name, file_size_bytes, drive_web_view_link')
        .single();

      if (dbError || !insertedFile) {
        console.error('DB insert file error:', dbError);
        return jsonError(500, 'FILE_DB_SAVE_FAILED', 'Файл загружен, но не удалось сохранить его в системе.');
      }

      results.push({
        id: insertedFile.id,
        name: insertedFile.normalized_file_name || insertedFile.original_file_name,
        originalName: insertedFile.original_file_name || null,
        size: insertedFile.file_size_bytes ?? null,
        fileId: upload.fileId,
        url: insertedFile.drive_web_view_link ?? null,
      });
    }

    return Response.json({ ok: true, data: { uploaded: results } });
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    return jsonError(500, 'UPLOAD_FAILED', err instanceof Error ? err.message : 'Не удалось загрузить файл.');
  }
}