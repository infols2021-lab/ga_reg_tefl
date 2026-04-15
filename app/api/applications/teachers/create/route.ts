import { NextResponse } from 'next/server';
import { createTeacherApplication } from '@/lib/applications/teachers';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (
      !body.firstName ||
      !body.surname ||
      !body.email ||
      !body.dateOfBirth ||
      !body.addressLine ||
      !body.country ||
      !body.phoneNumber ||
      !body.educationHistory ||
      !body.englishLevel
    ) {
      return NextResponse.json(
        { ok: false, error: { message: 'Заполни все поля' } },
        { status: 400 }
      );
    }

    const app = await createTeacherApplication(body);

    return NextResponse.json({
      ok: true,
      data: { id: app.id },
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        ok: false,
        error: { message: e.message || 'Ошибка создания заявки' },
      },
      { status: 500 }
    );
  }
}