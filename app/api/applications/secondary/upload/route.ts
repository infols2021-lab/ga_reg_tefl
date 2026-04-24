import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  GoogleDriveAuthRequiredError,
  uploadFileToDrive,
} from '@/lib/google/drive';

export const runtime = 'nodejs';

function jsonError(status: number, code: string, message: string) {
  return Response.json(
    { ok: false, error: { code, message } },
    { status }
  );
}

function sanitizeFileNamePart(str: string) {
  return str.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim();
}

function getFileExtension(fileName: string, mimeType?: string | null) {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex > -1 && dotIndex < fileName.length - 1) return fileName.slice(dotIndex);
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
  };
  return map[mimeType || ''] || '';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const applicationId = url.searchParams.get('applicationId');
  if (!applicationId) {
    return jsonError(400, 'APPLICATION_ID_REQUIRED', 'Нет applicationId');
  }

  const supabase = createServerSupabaseClient();
  const { data: files, error } = await supabase
    .from('application_files')
    .select('id, normalized_file_name, original_file_name, file_size_bytes, drive_web_view_link, created_at')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false });

  if (error) {
    return jsonError(500, 'FILES_LOAD_FAILED', 'Не удалось загрузить список файлов');
  }

  return Response.json({
    ok: true,
    data: {
      files: (files || []).map((f) => ({
        id: f.id,
        name: f.normalized_file_name || f.original_file_name,
        originalName: f.original_file_name,
        size: f.file_size_bytes,
        url: f.drive_web_view_link ?? null,
      })),
    },
  });
}

export async function POST(request: Request) {
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

    const cookieStore = await cookies();
    const googleAccessToken = cookieStore.get('google_drive_access_token')?.value || null;
    const googleRefreshToken = cookieStore.get('google_drive_refresh_token')?.value || null;

    if (!googleAccessToken && !googleRefreshToken) {
      return jsonError(401, 'GOOGLE_DRIVE_AUTH_REQUIRED', 'Сначала подключите Google Drive.');
    }

    // Получаем folderId для secondary из переменных окружения
    const folderId = process.env.GOOGLE_DRIVE_SECONDARY_FOLDER_ID;
    if (!folderId) {
      throw new Error('GOOGLE_DRIVE_SECONDARY_FOLDER_ID не задан');
    }

    const supabase = createServerSupabaseClient();

    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .single();
    if (appError || !app) {
      return jsonError(404, 'APPLICATION_NOT_FOUND', 'Заявка не найдена.');
    }

    // Загрузка деталей (имя, фамилия, дата рождения) для формирования имени файла
    const { data: details, error: detailsError } = await supabase
      .from('secondary_application_details')
      .select('candidate_first_name, candidate_surname, date_of_birth')
      .eq('application_id', applicationId)
      .single();
    if (detailsError || !details) {
      return jsonError(404, 'APPLICATION_DETAILS_NOT_FOUND', 'Детали заявки не найдены.');
    }

    const results = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const firstName = sanitizeFileNamePart(details.candidate_first_name || '');
      const surname = sanitizeFileNamePart(details.candidate_surname || '');
      const dob = details.date_of_birth ? new Date(details.date_of_birth).toISOString().slice(0, 10) : '';
      const baseName = [firstName, surname, dob].filter(Boolean).join(' ');
      const extension = getFileExtension(file.name, file.type);
      const finalFileName = baseName ? `${baseName}${extension}` : `${Date.now()}${extension}`;

      const upload = await uploadFileToDrive({
        buffer,
        fileName: finalFileName,
        mimeType: file.type,
        folderId, // GOOGLE_DRIVE_SECONDARY_FOLDER_ID
        accessToken: googleAccessToken,
        refreshToken: googleRefreshToken,
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
        return jsonError(500, 'FILE_DB_SAVE_FAILED', 'Файл загружен, но не сохранён в базе.');
      }

      results.push({
        id: insertedFile.id,
        name: insertedFile.normalized_file_name || insertedFile.original_file_name,
        originalName: insertedFile.original_file_name,
        size: insertedFile.file_size_bytes,
        fileId: upload.fileId,
        url: insertedFile.drive_web_view_link ?? null,
      });
    }

    return Response.json({ ok: true, data: { uploaded: results } });
  } catch (err: any) {
    console.error('SECONDARY UPLOAD ERROR:', err);
    if (err instanceof GoogleDriveAuthRequiredError) {
      return jsonError(401, 'GOOGLE_DRIVE_AUTH_REQUIRED', 'Сначала подключите Google Drive.');
    }
    return jsonError(500, 'UPLOAD_FAILED', err.message || 'Не удалось загрузить файл.');
  }
}