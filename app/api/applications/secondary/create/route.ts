import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Шаг 1 обязательные поля (одинаковые с primary)
    if (
      !body.candidateFirstName ||
      !body.candidateSurname ||
      !body.dateOfBirth ||
      !body.guardianFirstName ||
      !body.guardianSurname ||
      !body.email ||
      !body.phone
    ) {
      return NextResponse.json(
        { ok: false, error: { message: 'Заполни все поля' } },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const fullName = `${body.candidateFirstName} ${body.candidateSurname}`;

    // Вставка в applications
    const { data: app, error: appError } = await supabase
      .from('applications')
      .insert({
        program_type: 'secondary_school',
        status: 'draft',
        applicant_email: body.email,
        applicant_phone: body.phone,
        applicant_full_name: fullName,
        current_step: 1,
      })
      .select('*')
      .single();

    if (appError) throw appError;

    // Вставка в secondary_application_details
    const { error: detailsError } = await supabase
      .from('secondary_application_details')
      .insert({
        application_id: app.id,
        candidate_first_name: body.candidateFirstName,
        candidate_surname: body.candidateSurname,
        date_of_birth: body.dateOfBirth,
        guardian_first_name: body.guardianFirstName,
        guardian_surname: body.guardianSurname,
        email: body.email,
        phone_number: body.phone,
      });

    if (detailsError) throw detailsError;

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