import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.applicationId) {
      return NextResponse.json(
        { ok: false, error: { message: 'Нет applicationId' } },
        { status: 400 }
      );
    }

    if (![1, 2, 3].includes(body.step)) {
      return NextResponse.json(
        { ok: false, error: { message: 'Неверный шаг' } },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Шаг 1: обновление личных данных
    if (body.step === 1) {
      const { error } = await supabase
        .from('secondary_application_details')
        .update({
          candidate_first_name: body.data?.candidateFirstName,
          candidate_surname: body.data?.candidateSurname,
          date_of_birth: body.data?.dateOfBirth,
          guardian_first_name: body.data?.guardianFirstName,
          guardian_surname: body.data?.guardianSurname,
          email: body.data?.email,
          phone_number: body.data?.phone,
        })
        .eq('application_id', body.applicationId);

      if (error) throw error;

      // Синхронизируем email и телефон с applications
      const { error: appUpdateError } = await supabase
        .from('applications')
        .update({
          applicant_email: body.data?.email,
          applicant_phone: body.data?.phone,
          applicant_full_name: body.data?.candidateFirstName
            ? `${body.data.candidateFirstName} ${body.data.candidateSurname || ''}`
            : undefined,
        })
        .eq('id', body.applicationId);

      if (appUpdateError) throw appUpdateError;
    }

    // Шаг 2: курсы и документы
    if (body.step === 2) {
      // Обновление выбранных курсов
      const { error: deleteError } = await supabase
        .from('secondary_application_selected_courses')
        .delete()
        .eq('application_id', body.applicationId);

      if (deleteError) throw deleteError;

      if (body.data?.selectedCourseIds?.length) {
        const rows = body.data.selectedCourseIds.map((id: string) => ({
          application_id: body.applicationId,
          course_id: id,
        }));

        const { error } = await supabase
          .from('secondary_application_selected_courses')
          .insert(rows);

        if (error) throw error;
      }

      // Флаг подтверждения загрузки документа
      const { error } = await supabase
        .from('applications')
        .update({
          confirmed_id_document_attached: body.data?.confirmedIdDocumentAttached ?? false,
          current_step: 2,
        })
        .eq('id', body.applicationId);

      if (error) throw error;
    }

    // Шаг 3: review (согласия, заметки)
    if (body.step === 3) {
      const { error } = await supabase
        .from('applications')
        .update({
          consent_personal_data: body.data?.consentPersonalData ?? false,
          consent_terms: body.data?.consentTerms ?? false,
          confirmed_id_document_attached: body.data?.confirmedIdDocumentAttached ?? false,
          current_step: 3,
        })
        .eq('id', body.applicationId);

      if (error) throw error;

      // Если есть поле review_notes, сохраним его в деталях
      if (body.data?.reviewNotes !== undefined) {
        const { error: notesError } = await supabase
          .from('secondary_application_details')
          .update({
            review_notes: body.data.reviewNotes,
          })
          .eq('application_id', body.applicationId);

        if (notesError) throw notesError;
      }
    }

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