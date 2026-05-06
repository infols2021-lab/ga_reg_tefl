import { google } from 'googleapis';
import { Readable } from 'stream';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`ENV ERROR: не задана переменная ${name}`);
  }
  return value;
}

// Создаёт OAuth2-клиент, который всегда использует refresh-токен
function getDriveClient() {
  const clientId = getEnv('GOOGLE_OAUTH_CLIENT_ID');
  const clientSecret = getEnv('GOOGLE_OAUTH_CLIENT_SECRET');
  const redirectUri = getEnv('GOOGLE_OAUTH_REDIRECT_URI');
  const refreshToken = getEnv('GOOGLE_DRIVE_REFRESH_TOKEN');

  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  auth.setCredentials({ refresh_token: refreshToken });

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
  const rootFolderId = getEnv('GOOGLE_DRIVE_TEACHERS_FOLDER_ID');
  return { folderId: rootFolderId };
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
    await drive.files.delete({ fileId: params.fileId });
  } catch (err: any) {
    console.error('❌ deleteFileFromDrive ERROR:');
    logGoogleError(err);
    throw new Error(err?.message || 'Ошибка удаления файла из Google Drive');
  }
}