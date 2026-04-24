import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  deleteFileFromDrive,
  GoogleDriveAuthRequiredError,
} from '@/lib/google/drive';

export const runtime = 'nodejs';

function jsonError(status: number, code: string, message: string) {
  return Response.json(
    { ok: false, error: { code, message } },
    { status }
  );
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const applicationId = body.applicationId?.trim();
    const fileId = body.fileId?.trim();

    if (!applicationId) {
      return jsonError(400, 'APPLICATION_ID_REQUIRED', 'Не передан applicationId.');
    }
    if (!fileId) {
      return jsonError(400, 'FILE_ID_REQUIRED', 'Не передан fileId.');
    }

    const cookieStore = await cookies();
    const googleAccessToken = cookieStore.get('google_drive_access_token')?.value || null;
    const googleRefreshToken = cookieStore.get('google_drive_refresh_token')?.value || null;

    if (!googleAccessToken && !googleRefreshToken) {
      return jsonError(401, 'GOOGLE_DRIVE_AUTH_REQUIRED', 'Сначала подключите Google Drive.');
    }

    const supabase = createServerSupabaseClient();

    const { data: existingFile, error: fileLoadError } = await supabase
      .from('application_files')
      .select('id, application_id, drive_file_id')
      .eq('id', fileId)
      .eq('application_id', applicationId)
      .single();

    if (fileLoadError || !existingFile) {
      return jsonError(404, 'FILE_NOT_FOUND', 'Файл не найден.');
    }

    if (existingFile.drive_file_id) {
      await deleteFileFromDrive({
        fileId: existingFile.drive_file_id,
        accessToken: googleAccessToken,
        refreshToken: googleRefreshToken,
      });
    }

    const { error: deleteDbError } = await supabase
      .from('application_files')
      .delete()
      .eq('id', existingFile.id)
      .eq('application_id', applicationId);

    if (deleteDbError) {
      return jsonError(500, 'FILE_DB_DELETE_FAILED', 'Файл удалён из Google Drive, но не из базы.');
    }

    return Response.json({ ok: true, data: { deletedFileId: existingFile.id } });
  } catch (err) {
    console.error('SECONDARY DELETE FILE ERROR:', err);
    if (err instanceof GoogleDriveAuthRequiredError) {
      return jsonError(401, 'GOOGLE_DRIVE_AUTH_REQUIRED', 'Сначала подключите Google Drive.');
    }
    return jsonError(500, 'FILE_DELETE_FAILED', err instanceof Error ? err.message : 'Не удалось удалить файл.');
  }
}