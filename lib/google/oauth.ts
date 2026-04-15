import { google } from 'googleapis';

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`ENV ERROR: не задана переменная ${name}`);
  }

  return value;
}

export function getGoogleOAuthClient() {
  const clientId = getEnv('GOOGLE_OAUTH_CLIENT_ID');
  const clientSecret = getEnv('GOOGLE_OAUTH_CLIENT_SECRET');
  const redirectUri = getEnv('GOOGLE_OAUTH_REDIRECT_URI');

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGoogleOAuthScopes(): string[] {
  return ['https://www.googleapis.com/auth/drive'];
}

export function buildGoogleOAuthUrl(state: string): string {
  const client = getGoogleOAuthClient();

  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: true,
    scope: getGoogleOAuthScopes(),
    state,
  });
}

export async function exchangeGoogleOAuthCode(code: string) {
  const client = getGoogleOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}