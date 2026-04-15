import { NextResponse } from 'next/server';
import { updateTeacherStep } from '@/lib/applications/teachers';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.applicationId) {
      return NextResponse.json(
        { ok: false, error: { message: 'Нет applicationId' } },
        { status: 400 }
      );
    }

    if (![1, 2, 3, 4].includes(body.step)) {
      return NextResponse.json(
        { ok: false, error: { message: 'Неверный шаг' } },
        { status: 400 }
      );
    }

    await updateTeacherStep(body.applicationId, body.step, body.data);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        ok: false,
        error: { message: e.message || 'Ошибка обновления' },
      },
      { status: 500 }
    );
  }
}