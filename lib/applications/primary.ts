import { createServerSupabaseClient } from '@/lib/supabase/server';
import { exportPrimarySchoolApplicationToSheets } from '@/lib/google/sheets';

export async function createPrimaryApplication(data: any) {
  const supabase = createServerSupabaseClient();

  const fullName = `${data.candidateFirstName} ${data.candidateSurname}`;

  const { data: app, error: appError } = await supabase
    .from('applications')
    .insert({
      program_type: 'primary_school',
      status: 'draft',
      applicant_email: data.email,
      applicant_phone: data.phone,
      applicant_full_name: fullName,
      current_step: 1,
    })
    .select('*')
    .single();

  if (appError) throw appError;

  const { error: detailsError } = await supabase
    .from('primary_application_details')
    .insert({
      application_id: app.id,
      candidate_first_name: data.candidateFirstName,
      candidate_surname: data.candidateSurname,
      date_of_birth: data.dateOfBirth,
      guardian_first_name: data.guardianFirstName,
      guardian_surname: data.guardianSurname,
      email: data.email,
      phone_number: data.phone,
    });

  if (detailsError) throw detailsError;

  return app;
}

export async function updatePrimaryStep(
  applicationId: string,
  step: number,
  data: any
) {
  const supabase = createServerSupabaseClient();

  if (step === 1) {
    const { error } = await supabase
      .from('primary_application_details')
      .update({
        candidate_first_name: data.candidateFirstName,
        candidate_surname: data.candidateSurname,
        date_of_birth: data.dateOfBirth,
        guardian_first_name: data.guardianFirstName,
        guardian_surname: data.guardianSurname,
        email: data.email,
        phone_number: data.phone,
      })
      .eq('application_id', applicationId);

    if (error) throw error;

    // синхронизация с applications
    const { error: appUpdateError } = await supabase
      .from('applications')
      .update({
        applicant_email: data.email,
        applicant_phone: data.phone,
        applicant_full_name: `${data.candidateFirstName} ${data.candidateSurname}`,
      })
      .eq('id', applicationId);

    if (appUpdateError) throw appUpdateError;
  }

  if (step === 2) {
    // курсы
    const { error: deleteError } = await supabase
      .from('primary_application_selected_courses')
      .delete()
      .eq('application_id', applicationId);

    if (deleteError) throw deleteError;

    if (data.selectedCourseIds?.length) {
      const rows = data.selectedCourseIds.map((id: string) => ({
        application_id: applicationId,
        course_id: id,
      }));

      const { error } = await supabase
        .from('primary_application_selected_courses')
        .insert(rows);

      if (error) throw error;
    }

    // флаг документа
    const { error } = await supabase
      .from('applications')
      .update({
        confirmed_id_document_attached: data.confirmedIdDocumentAttached ?? false,
        current_step: 2,
      })
      .eq('id', applicationId);

    if (error) throw error;
  }

  if (step === 3) {
    const { error } = await supabase
      .from('primary_application_details')
      .update({
        review_notes: data.reviewNotes ?? null,
      })
      .eq('application_id', applicationId);

    if (error) throw error;

    const { error: appError } = await supabase
      .from('applications')
      .update({
        consent_personal_data: data.consentPersonalData ?? false,
        consent_terms: data.consentTerms ?? false,
        consent_pd_processing: data.consentPdProcessing ?? false,
        consent_pd_distribution: data.consentPdDistribution ?? false,
        confirmed_id_document_attached: data.confirmedIdDocumentAttached ?? false,
        current_step: 3,
      })
      .eq('id', applicationId);

    if (appError) throw appError;
  }
}

export async function submitPrimaryApplication(applicationId: string) {
  const supabase = createServerSupabaseClient();

  const { error: submitError } = await supabase.rpc('submit_primary_application', {
    p_application_id: applicationId,
  });

  if (submitError) {
    // fallback
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status: 'submitted',
        is_completed: true,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) throw updateError;
  }

  try {
    await exportPrimarySchoolApplicationToSheets(applicationId);

    const { error: exportUpdateError } = await supabase
      .from('applications')
      .update({
        exported_to_google_sheets: true,
        exported_to_google_sheets_at: new Date().toISOString(),
        google_sheets_export_error: null,
      })
      .eq('id', applicationId);

    if (exportUpdateError) throw exportUpdateError;
  } catch (exportError) {
    const exportMessage =
      exportError instanceof Error
        ? exportError.message
        : 'Неизвестная ошибка выгрузки в Google Sheets';

    await supabase
      .from('applications')
      .update({
        exported_to_google_sheets: false,
        exported_to_google_sheets_at: null,
        google_sheets_export_error: exportMessage,
      })
      .eq('id', applicationId);

    throw new Error(
      `Заявка отправлена, но не выгрузилась в Google Sheets: ${exportMessage}`
    );
  }
}