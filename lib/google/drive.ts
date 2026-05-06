import { google } from 'googleapis';
import { Readable } from 'stream';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`ENV ERROR: не задана переменная ${name}`);
  }
  return value;
}

function getDriveClient() {
  const email = getEnv('GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL');
  const key = getEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY').replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

function logGoogleError(err: any) {
  console.error('❌ GOOGLE DRIVE ERROR FULL:');
  if (err?.response?.data) {
    console.error('response.data:', JSON.stringify(err.response.data, null, 2));
  }
  if (err?.response?.status) {
    console.error('status:', err.response.status);
  }
  if (err?.errors) {
    console.error('errors:', err.errors);
  }
  console.error('message:', err?.message);
  console.error('stack:', err?.stack);
}

export type UploadResult = {
  fileId: string;
  webViewLink: string | null;
  downloadLink: string | null;
};

export function getFolderIdByProgram(programType: string): string {
  switch (programType) {
    case 'primary':
      return getEnv('GOOGLE_DRIVE_PRIMARY_FOLDER_ID');
    case 'secondary':
      return getEnv('GOOGLE_DRIVE_SECONDARY_FOLDER_ID');
    default:
      return getEnv('GOOGLE_DRIVE_TEACHERS_FOLDER_ID');
  }
}

export async function createApplicationFolder(): Promise<{ folderId: string }> {
  try {
    const rootFolderId = getEnv('GOOGLE_DRIVE_TEACHERS_FOLDER_ID');
    return { folderId: rootFolderId };
  } catch (err: any) {
    logGoogleError(err);
    throw new Error(err?.message || 'Не удалось получить папку для загрузки файлов.');
  }
}

export async function uploadFileToDrive(params: {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  folderId: string;
}): Promise<UploadResult> {
  try {
    const drive = getDriveClient();

    const stream = Readable.from(params.buffer);

    const res = await drive.files.create({
      requestBody: {
        name: params.fileName,
        parents: [params.folderId],
      },
      media: {
        mimeType: params.mimeType || 'application/octet-stream',
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    const fileId = res.data.id;
    if (!fileId) {
      throw new Error('Google не вернул id файла');
    }

    return {
      fileId,
      webViewLink: res.data.webViewLink ?? null,
      downloadLink: res.data.webContentLink ?? null,
    };
  } catch (err: any) {
    console.error('❌ uploadFileToDrive ERROR:');
    logGoogleError(err);
    throw new Error(err?.message || 'Ошибка загрузки файла в Google Drive');
  }
}

export async function deleteFileFromDrive(params: {
  fileId: string;
}): Promise<void> {
  try {
    const drive = getDriveClient();
    await drive.files.delete({
      fileId: params.fileId,
      supportsAllDrives: true,
    });
  } catch (err: any) {
    console.error('❌ deleteFileFromDrive ERROR:');
    logGoogleError(err);
    throw new Error(err?.message || 'Ошибка удаления файла из Google Drive');
  }
}