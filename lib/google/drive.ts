import { google } from 'googleapis';
import { Readable } from 'stream';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`ENV ERROR: не задана переменная ${name}`);
  }
  return value;
}

function buildGoogleOAuthClient(params: {
  accessToken?: string | null;
  refreshToken?: string | null;
}) {
  const clientId = getEnv('GOOGLE_OAUTH_CLIENT_ID');
  const clientSecret = getEnv('GOOGLE_OAUTH_CLIENT_SECRET');
  const redirectUri = getEnv('GOOGLE_OAUTH_REDIRECT_URI');

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials({
    access_token: params.accessToken || undefined,
    refresh_token: params.refreshToken || undefined,
  });

  return oauth2Client;
}

function getDrive(params: {
  accessToken?: string | null;
  refreshToken?: string | null;
}) {
  return google.drive({
    version: 'v3',
    auth: buildGoogleOAuthClient(params),
  });
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

export class GoogleDriveAuthRequiredError extends Error {
  code = 'GOOGLE_DRIVE_AUTH_REQUIRED';

  constructor(message = 'Требуется авторизация Google Drive.') {
    super(message);
    this.name = 'GoogleDriveAuthRequiredError';
  }
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
    console.log('📁 ROOT FOLDER:', rootFolderId);
    console.log('✅ USING ROOT FOLDER WITHOUT NESTED FOLDERS');
    return { folderId: rootFolderId };
  } catch (err: any) {
    console.error('❌ createApplicationFolder ERROR:');
    logGoogleError(err);
    throw new Error(
      err?.message || 'Не удалось получить папку для загрузки файлов.'
    );
  }
}

export async function uploadFileToDrive(params: {
  buffer: Buffer;
  fileName: string;
  mimeType?: string;
  folderId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
}): Promise<UploadResult> {
  try {
    if (!params.accessToken && !params.refreshToken) {
      throw new GoogleDriveAuthRequiredError();
    }

    const drive = getDrive({
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
    });

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

    const status = err?.response?.status;
    const message = String(err?.message || '');

    if (
      err instanceof GoogleDriveAuthRequiredError ||
      status === 401 ||
      message.toLowerCase().includes('invalid credentials') ||
      message.toLowerCase().includes('login required') ||
      message.toLowerCase().includes('unauthorized')
    ) {
      throw new GoogleDriveAuthRequiredError();
    }

    throw new Error(err?.message || 'Ошибка загрузки файла в Google Drive');
  }
}

export async function deleteFileFromDrive(params: {
  fileId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
}): Promise<void> {
  try {
    if (!params.accessToken && !params.refreshToken) {
      throw new GoogleDriveAuthRequiredError();
    }

    const drive = getDrive({
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
    });

    await drive.files.delete({
      fileId: params.fileId,
      supportsAllDrives: true,
    });
  } catch (err: any) {
    console.error('❌ deleteFileFromDrive ERROR:');
    logGoogleError(err);

    const status = err?.response?.status;
    const message = String(err?.message || '');

    if (
      err instanceof GoogleDriveAuthRequiredError ||
      status === 401 ||
      message.toLowerCase().includes('invalid credentials') ||
      message.toLowerCase().includes('login required') ||
      message.toLowerCase().includes('unauthorized')
    ) {
      throw new GoogleDriveAuthRequiredError();
    }

    throw new Error(err?.message || 'Ошибка удаления файла из Google Drive');
  }
}