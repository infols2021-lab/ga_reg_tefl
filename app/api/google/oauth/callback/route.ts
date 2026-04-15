import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { exchangeGoogleOAuthCode } from '@/lib/google/oauth';

export const runtime = 'nodejs';

type OAuthStatePayload = {
  nonce: string;
  returnTo: string;
  applicationId: string | null;
};

function fromBase64Url<T>(value: string): T {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
}

function buildRedirectUrl(params: {
  origin: string;
  returnTo?: string | null;
  applicationId?: string | null;
  connected?: boolean;
  error?: string | null;
}) {
  const redirectUrl = new URL(params.returnTo || '/apply/teachers', params.origin);

  if (params.applicationId) {
    redirectUrl.searchParams.set('applicationId', params.applicationId);
  }

  if (params.connected) {
    redirectUrl.searchParams.set('googleDriveConnected', '1');
  }

  if (params.error) {
    redirectUrl.searchParams.set('googleDriveError', params.error);
  }

  return redirectUrl;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  const cookieStore = await cookies();
  const expectedNonce = cookieStore.get('google_oauth_state_nonce')?.value || null;

  if (oauthError) {
    const redirectUrl = buildRedirectUrl({
      origin: url.origin,
      error: oauthError,
    });

    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state) {
    const redirectUrl = buildRedirectUrl({
      origin: url.origin,
      error: 'missing_oauth_params',
    });

    return NextResponse.redirect(redirectUrl);
  }

  let parsedState: OAuthStatePayload;

  try {
    parsedState = fromBase64Url<OAuthStatePayload>(state);
  } catch {
    const redirectUrl = buildRedirectUrl({
      origin: url.origin,
      error: 'invalid_state',
    });

    return NextResponse.redirect(redirectUrl);
  }

  if (!expectedNonce || parsedState.nonce !== expectedNonce) {
    const redirectUrl = buildRedirectUrl({
      origin: url.origin,
      returnTo: parsedState.returnTo,
      applicationId: parsedState.applicationId,
      error: 'state_mismatch',
    });

    return NextResponse.redirect(redirectUrl);
  }

  try {
    const tokens = await exchangeGoogleOAuthCode(code);

    const redirectUrl = buildRedirectUrl({
      origin: url.origin,
      returnTo: parsedState.returnTo,
      applicationId: parsedState.applicationId,
      connected: true,
    });

    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set('google_oauth_state_nonce', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });

    if (tokens.access_token) {
      response.cookies.set('google_drive_access_token', tokens.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: tokens.expiry_date
          ? Math.max(60, Math.floor((tokens.expiry_date - Date.now()) / 1000))
          : 60 * 60,
      });
    }

    if (tokens.refresh_token) {
      response.cookies.set('google_drive_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    console.error('GOOGLE OAUTH CALLBACK ERROR:', error);

    const redirectUrl = buildRedirectUrl({
      origin: url.origin,
      returnTo: parsedState.returnTo,
      applicationId: parsedState.applicationId,
      error: 'token_exchange_failed',
    });

    return NextResponse.redirect(redirectUrl);
  }
}