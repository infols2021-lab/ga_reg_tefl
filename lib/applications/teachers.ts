import { createServerSupabaseClient } from '@/lib/supabase/server';
import { exportTeacherApplicationToSheets } from '@/lib/google/sheets';

export async function createTeacherApplication(data: any) {
  const supabase = createServerSupabaseClient();

  const { data: app, error: appError } = await supabase
    .from('applications')
    .insert({
      program_type: 'teachers',
      status: 'draft',
      applicant_email: data.email,
      applicant_phone: data.phoneNumber,
      applicant_full_name: `${data.firstName} ${data.surname}`,
      current_step: 1,
    })
    .select('*')
    .single();

  if (appError) throw appError;

  const { error: detailsError } = await supabase
    .from('teacher_application_details')
    .insert({
      application_id: app.id,
      first_name: data.firstName,
      surname: data.surname,
      email: data.email,
      date_of_birth: data.dateOfBirth,
      address_line: data.addressLine,
      country: data.country,
      phone_number: data.phoneNumber,
      education_history: data.educationHistory,
      english_level: data.englishLevel,
      current_teaching_role: data.currentTeachingRole,
      teaching_experience: data.teachingExperience,
    });

  if (detailsError) throw detailsError;

  return app;
}

export async function updateTeacherStep(
  applicationId: string,
  step: number,
  data: any
) {
  const supabase = createServerSupabaseClient();

  if (step === 1) {
    const { error } = await supabase
      .from('teacher_application_details')
      .update({
        first_name: data.firstName,
        surname: data.surname,
        email: data.email,
        date_of_birth: data.dateOfBirth,
        address_line: data.addressLine,
        country: data.country,
        phone_number: data.phoneNumber,
        education_history: data.educationHistory,
        english_level: data.englishLevel,
        current_teaching_role: data.currentTeachingRole,
        teaching_experience: data.teachingExperience,
      })
      .eq('application_id', applicationId);

    if (error) throw error;
  }

  if (step === 2) {
    const { error: deleteError } = await supabase
      .from('teacher_application_selected_courses')
      .delete()
      .eq('application_id', applicationId);

    if (deleteError) throw deleteError;

    if (data.selectedCourseIds?.length) {
      const rows = data.selectedCourseIds.map((id: string) => ({
        application_id: applicationId,
        course_id: id,
      }));

      const { error } = await supabase
        .from('teacher_application_selected_courses')
        .insert(rows);

      if (error) throw error;
    }

    const { error } = await supabase
      .from('applications')
      .update({
        confirmed_id_document_attached: data.confirmedIdDocumentAttached,
        current_step: 2,
      })
      .eq('id', applicationId);

    if (error) throw error;
  }

  if (step === 3) {
    const { error } = await supabase
      .from('teacher_application_details')
      .update({
        personal_statement: data.personalStatement,
        task_answer_a: data.taskAnswerA,
        task_answer_b: data.taskAnswerB,
        task_answer_c: data.taskAnswerC,
        review_notes: data.reviewNotes ?? null,
      })
      .eq('application_id', applicationId);

    if (error) throw error;
  }

  if (step === 4) {
    const { error: detailsError } = await supabase
      .from('teacher_application_details')
      .update({
        review_notes: data.reviewNotes ?? null,
      })
      .eq('application_id', applicationId);

    if (detailsError) throw detailsError;

    const { error } = await supabase
      .from('applications')
      .update({
        consent_personal_data: data.consentPersonalData,
        consent_terms: data.consentTerms,
        confirmed_id_document_attached: data.confirmedIdDocumentAttached,
        current_step: 4,
      })
      .eq('id', applicationId);

    if (error) throw error;
  }
}

export async function submitTeacherApplication(applicationId: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc('submit_teacher_application', {
    p_application_id: applicationId,
  });

  if (error) throw error;

  try {
    await exportTeacherApplicationToSheets(applicationId);

    const { error: exportUpdateError } = await supabase
      .from('applications')
      .update({
        exported_to_google_sheets: true,
        exported_to_google_sheets_at: new Date().toISOString(),
        google_sheets_export_error: null,
      })
      .eq('id', applicationId);

    if (exportUpdateError) {
      throw exportUpdateError;
    }
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

  return data;
}