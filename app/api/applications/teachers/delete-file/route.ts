import { createServerSupabaseClient } from '@/lib/supabase/server';
import { deleteFileFromDrive } from '@/lib/google/drive';

export const runtime = 'nodejs';

function jsonError(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

type DeleteFileBody = {
  applicationId?: string;
  fileId?: string;
};

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as DeleteFileBody;
    const applicationId = body.applicationId?.trim();
    const fileId = body.fileId?.trim();

    if (!applicationId) {
      return jsonError(400, 'APPLICATION_ID_REQUIRED', 'Не передан applicationId.');
    }
    if (!fileId) {
      return jsonError(400, 'FILE_ID_REQUIRED', 'Не передан fileId.');
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
      await deleteFileFromDrive({ fileId: existingFile.drive_file_id });
    }

    const { error: deleteDbError } = await supabase
      .from('application_files')
      .delete()
      .eq('id', existingFile.id)
      .eq('application_id', applicationId);

    if (deleteDbError) {
      console.error('DB delete file error:', deleteDbError);
      return jsonError(500, 'FILE_DB_DELETE_FAILED', 'Файл удалён из Google Drive, но не удалён из системы.');
    }

    return Response.json({ ok: true, data: { deletedFileId: existingFile.id } });
  } catch (err) {
    console.error('DELETE FILE ERROR:', err);
    return jsonError(500, 'FILE_DELETE_FAILED', err instanceof Error ? err.message : 'Не удалось удалить файл.');
  }
}