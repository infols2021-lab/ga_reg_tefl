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

    if (body.step === 1) {
      const isOver18 = body.data?.isOver18 ?? false;

      const updates: any = {
        candidate_first_name: body.data?.candidateFirstName,
        candidate_surname: body.data?.candidateSurname,
        date_of_birth: body.data?.dateOfBirth,
        email: body.data?.email,
        phone_number: body.data?.phone,
      };

      if (isOver18) {
        updates.guardian_first_name = null;
        updates.guardian_surname = null;
      } else {
        updates.guardian_first_name = body.data?.guardianFirstName;
        updates.guardian_surname = body.data?.guardianSurname;
      }

      if (body.data?.examLocationId !== undefined) {
        updates.exam_location_id = body.data.examLocationId;
      }

      const { error } = await supabase
        .from('secondary_application_details')
        .update(updates)
        .eq('application_id', body.applicationId);

      if (error) throw error;

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

    if (body.step === 2) {
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

      const { error } = await supabase
        .from('applications')
        .update({
          confirmed_id_document_attached: body.data?.confirmedIdDocumentAttached ?? false,
          current_step: 2,
        })
        .eq('id', body.applicationId);

      if (error) throw error;
    }

    if (body.step === 3) {
      const { error } = await supabase
        .from('applications')
        .update({
          consent_personal_data: body.data?.consentPersonalData ?? false,
          consent_terms: body.data?.consentTerms ?? false,
          consent_pd_processing: body.data?.consentPdProcessing ?? false,
          consent_pd_distribution: body.data?.consentPdDistribution ?? false,
          confirmed_id_document_attached: body.data?.confirmedIdDocumentAttached ?? false,
          current_step: 3,
        })
        .eq('id', body.applicationId);

      if (error) throw error;

      if (body.data?.reviewNotes !== undefined) {
        const { error: notesError } = await supabase
          .from('secondary_application_details')
          .update({ review_notes: body.data.reviewNotes })
          .eq('application_id', body.applicationId);

        if (notesError) throw notesError;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: { message: e.message || 'Ошибка обновления' } },
      { status: 500 }
    );
  }
}