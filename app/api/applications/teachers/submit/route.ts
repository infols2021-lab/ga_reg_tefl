import { NextResponse } from 'next/server';
import { submitTeacherApplication } from '@/lib/applications/teachers';

type SubmitTeacherApplicationBody = {
  applicationId?: string;
};

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function POST(req: Request) {
  try {
    let body: SubmitTeacherApplicationBody;

    try {
      body = (await req.json()) as SubmitTeacherApplicationBody;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: { message: 'Неверный JSON в запросе.' },
        },
        { status: 400 }
      );
    }

    const applicationId = normalizeString(body.applicationId);

    if (!applicationId || !isValidUuid(applicationId)) {
      return NextResponse.json(
        {
          ok: false,
          error: { message: 'Не передан корректный applicationId.' },
        },
        { status: 400 }
      );
    }

    await submitTeacherApplication(applicationId);

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error('POST /api/applications/teachers/submit error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Ошибка отправки заявки',
        },
      },
      { status: 500 }
    );
  }
}