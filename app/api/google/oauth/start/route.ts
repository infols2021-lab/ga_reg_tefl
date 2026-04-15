import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { buildGoogleOAuthUrl } from '@/lib/google/oauth';

export const runtime = 'nodejs';

type OAuthStatePayload = {
  nonce: string;
  returnTo: string;
  applicationId: string | null;
};

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url<T>(value: string): T {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const applicationId = url.searchParams.get('applicationId');
  const returnTo = '/apply/teachers';

  const nonce = randomUUID();

  const statePayload: OAuthStatePayload = {
    nonce,
    returnTo,
    applicationId,
  };

  const state = toBase64Url(JSON.stringify(statePayload));
  const cookieStore = await cookies();

  cookieStore.set('google_oauth_state_nonce', nonce, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  });

  const authUrl = buildGoogleOAuthUrl(state);

  return NextResponse.redirect(authUrl);
}

export { fromBase64Url };