import { google } from 'googleapis';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function getAuth() {
  const clientEmail = getEnv('GOOGLE_CLIENT_EMAIL');
  const privateKey = getEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function toCellValue(value: unknown): string | number | boolean {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value;
  return String(value);
}

function joinLines(values: Array<string | null | undefined>): string {
  return values
    .map((value) => (value ?? '').trim())
    .filter(Boolean)
    .join('\n');
}

function formatBool(value: boolean | null | undefined): string {
  return value ? 'Yes' : 'No';
}

function formatAmountRub(amountKobo: number | null | undefined): number | string {
  if (typeof amountKobo !== 'number') return '';
  return Number((amountKobo / 100).toFixed(2));
}

async function appendRow(
  spreadsheetId: string,
  sheetName: string,
  row: (string | number | boolean | null)[]
) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });
}

// --- Teacher export (без изменений) ---

export async function exportTeacherApplicationToSheets(applicationId: string) {
  const supabase = createServerSupabaseClient();

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select(
      `id, public_id, program_type, status, payment_status, payment_provider, applicant_email, applicant_phone, applicant_full_name, current_step, is_completed, consent_personal_data, consent_terms, confirmed_id_document_attached, amount_kobo, amount_currency, payment_order_id, payment_link, payment_reference, paid_at, submitted_at, source_system, source_path, taplink_button, created_at, updated_at`
    )
    .eq('id', applicationId)
    .single();

  if (applicationError || !application) {
    throw new Error('Не удалось получить заявку для выгрузки в Google Sheets.');
  }

  const { data: details, error: detailsError } = await supabase
    .from('teacher_application_details')
    .select(
      `first_name, surname, date_of_birth, email, address_line, country, phone_number, education_history, english_level, current_teaching_role, teaching_experience, personal_statement, task_answer_a, task_answer_b, task_answer_c, review_notes`
    )
    .eq('application_id', applicationId)
    .single();

  if (detailsError || !details) {
    throw new Error('Не удалось получить детали заявки для Google Sheets.');
  }

  const { data: selectedCourses, error: selectedCoursesError } = await supabase
    .from('teacher_application_selected_courses')
    .select(`title_snapshot, unit_price_kobo, quantity, currency`)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  if (selectedCoursesError) {
    throw new Error('Не удалось получить выбранные курсы для Google Sheets.');
  }

  const { data: files, error: filesError } = await supabase
    .from('application_files')
    .select(`normalized_file_name, original_file_name, drive_web_view_link, drive_download_link`)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  if (filesError) {
    throw new Error('Не удалось получить файлы заявки для Google Sheets.');
  }

  const selectedCoursesText = joinLines(
    (selectedCourses || []).map((course) => {
      const title = (course.title_snapshot || '').trim();
      const quantity = course.quantity || 1;
      const priceRub =
        typeof course.unit_price_kobo === 'number'
          ? `${Number((course.unit_price_kobo / 100).toFixed(2))} ₽`
          : '';
      return [title, quantity > 1 ? `x${quantity}` : '', priceRub]
        .filter(Boolean)
        .join(' — ');
    })
  );

  const uploadedFilesNamesText = joinLines(
    (files || []).map((file) => file.normalized_file_name || file.original_file_name || '')
  );

  const uploadedFilesLinksText = joinLines(
    (files || []).map((file) => file.drive_web_view_link || file.drive_download_link || '')
  );

  const row: (string | number | boolean | null)[] = [
    toCellValue(application.public_id),
    toCellValue(application.applicant_full_name),
    toCellValue(details.first_name),
    toCellValue(details.surname),
    toCellValue(details.email || application.applicant_email),
    toCellValue(details.date_of_birth),
    toCellValue(details.address_line),
    toCellValue(details.country),
    toCellValue(details.phone_number || application.applicant_phone),
    toCellValue(details.education_history),
    toCellValue(details.english_level),
    toCellValue(details.current_teaching_role),
    toCellValue(details.teaching_experience),
    toCellValue(selectedCoursesText),
    toCellValue(formatAmountRub(application.amount_kobo)),
    toCellValue(application.amount_currency),
    toCellValue(uploadedFilesNamesText),
    toCellValue(uploadedFilesLinksText),
    toCellValue(details.personal_statement),
    toCellValue(details.task_answer_a),
    toCellValue(details.task_answer_b),
    toCellValue(details.task_answer_c),
    toCellValue(details.review_notes),
    toCellValue(formatBool(application.consent_personal_data)),
    toCellValue(formatBool(application.consent_terms)),
    toCellValue(formatBool(application.confirmed_id_document_attached)),
    toCellValue(application.status),
    toCellValue(application.payment_status),
    toCellValue(application.payment_provider),
    toCellValue(application.payment_order_id),
    toCellValue(application.payment_reference),
    toCellValue(application.payment_link),
    toCellValue(application.submitted_at),
    toCellValue(application.paid_at),
    toCellValue(application.created_at),
    toCellValue(application.updated_at),
    toCellValue(application.source_system),
    toCellValue(application.source_path),
    toCellValue(application.taplink_button),
    toCellValue(application.program_type),
    toCellValue(application.current_step),
    toCellValue(formatBool(application.is_completed)),
  ];

  const spreadsheetId = getEnv('GOOGLE_SHEETS_TEACHERS_SPREADSHEET_ID');
  const sheetName = getEnv('GOOGLE_SHEETS_TEACHERS_SHEET_NAME');
  await appendRow(spreadsheetId, sheetName, row);
}

// --- Primary School export (с площадкой) ---

export async function exportPrimarySchoolApplicationToSheets(applicationId: string) {
  const supabase = createServerSupabaseClient();

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select(
      `id, public_id, program_type, status, applicant_email, applicant_phone, applicant_full_name, consent_personal_data, consent_terms, confirmed_id_document_attached, submitted_at, created_at`
    )
    .eq('id', applicationId)
    .single();

  if (applicationError || !application) {
    throw new Error('Не удалось получить заявку для выгрузки в Google Sheets.');
  }

  const { data: details, error: detailsError } = await supabase
    .from('primary_application_details')
    .select(
      `candidate_first_name, candidate_surname, date_of_birth, guardian_first_name, guardian_surname, email, phone_number, review_notes, exam_location_id`
    )
    .eq('application_id', applicationId)
    .single();

  if (detailsError || !details) {
    throw new Error('Не удалось получить детали заявки для Google Sheets.');
  }

  let examLocationText = '';
  if (details.exam_location_id) {
    const { data: location } = await supabase
      .from('exam_locations')
      .select('city, exam_date')
      .eq('id', details.exam_location_id)
      .single();
    if (location) {
      examLocationText = `${location.city}, ${location.exam_date}`;
    }
  }

  const { data: selectedCourses, error: selectedCoursesError } = await supabase
    .from('primary_application_selected_courses')
    .select(`title_snapshot, unit_price_kobo, quantity`)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  if (selectedCoursesError) {
    throw new Error('Не удалось получить выбранные курсы для Google Sheets.');
  }

  const { data: files, error: filesError } = await supabase
    .from('application_files')
    .select(`normalized_file_name, original_file_name, drive_web_view_link`)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  if (filesError) {
    throw new Error('Не удалось получить файлы заявки для Google Sheets.');
  }

  const selectedCoursesText = joinLines(
    (selectedCourses || []).map((course) => {
      const title = (course.title_snapshot || '').trim();
      const priceRub =
        typeof course.unit_price_kobo === 'number'
          ? `${Number((course.unit_price_kobo / 100).toFixed(2))} ₽`
          : '';
      return [title, priceRub].filter(Boolean).join(' — ');
    })
  );

  const uploadedFilesText = joinLines(
    (files || []).map((f) => f.normalized_file_name || f.original_file_name || '')
  );

  const row = [
    toCellValue(application.public_id),
    toCellValue(application.applicant_full_name),
    toCellValue(details.candidate_first_name),
    toCellValue(details.candidate_surname),
    toCellValue(details.date_of_birth),
    toCellValue(`${details.guardian_first_name} ${details.guardian_surname}`),
    toCellValue(details.email),
    toCellValue(details.phone_number),
    toCellValue(examLocationText), // <-- площадка добавлена
    toCellValue(selectedCoursesText),
    toCellValue(formatBool(application.confirmed_id_document_attached)),
    toCellValue(uploadedFilesText),
    toCellValue(formatBool(application.consent_personal_data)),
    toCellValue(formatBool(application.consent_terms)),
    toCellValue(details.review_notes),
    toCellValue(application.status),
    toCellValue(application.submitted_at),
    toCellValue(application.created_at),
  ];

  const spreadsheetId = getEnv('GOOGLE_SHEETS_TEACHERS_SPREADSHEET_ID');
  const sheetName = getEnv('GOOGLE_SHEETS_PRIMARY_SHEET_NAME');
  await appendRow(spreadsheetId, sheetName, row);
}

// --- Secondary School export (с площадкой) ---

export async function exportSecondarySchoolApplicationToSheets(applicationId: string) {
  const supabase = createServerSupabaseClient();

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select(
      `id, public_id, program_type, status, applicant_email, applicant_phone, applicant_full_name, consent_personal_data, consent_terms, confirmed_id_document_attached, submitted_at, created_at`
    )
    .eq('id', applicationId)
    .single();

  if (applicationError || !application) {
    throw new Error('Не удалось получить заявку для выгрузки в Google Sheets.');
  }

  const { data: details, error: detailsError } = await supabase
    .from('secondary_application_details')
    .select(
      `candidate_first_name, candidate_surname, date_of_birth, guardian_first_name, guardian_surname, email, phone_number, review_notes, exam_location_id`
    )
    .eq('application_id', applicationId)
    .single();

  if (detailsError || !details) {
    throw new Error('Не удалось получить детали заявки для Google Sheets.');
  }

  let examLocationText = '';
  if (details.exam_location_id) {
    const { data: location } = await supabase
      .from('exam_locations')
      .select('city, exam_date')
      .eq('id', details.exam_location_id)
      .single();
    if (location) {
      examLocationText = `${location.city}, ${location.exam_date}`;
    }
  }

  const { data: selectedCourses, error: selectedCoursesError } = await supabase
    .from('secondary_application_selected_courses')
    .select(`title_snapshot, unit_price_kobo, quantity`)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  if (selectedCoursesError) {
    throw new Error('Не удалось получить выбранные курсы для Google Sheets.');
  }

  const { data: files, error: filesError } = await supabase
    .from('application_files')
    .select(`normalized_file_name, original_file_name, drive_web_view_link`)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  if (filesError) {
    throw new Error('Не удалось получить файлы заявки для Google Sheets.');
  }

  const selectedCoursesText = joinLines(
    (selectedCourses || []).map((course) => {
      const title = (course.title_snapshot || '').trim();
      const priceRub =
        typeof course.unit_price_kobo === 'number'
          ? `${Number((course.unit_price_kobo / 100).toFixed(2))} ₽`
          : '';
      return [title, priceRub].filter(Boolean).join(' — ');
    })
  );

  const uploadedFilesText = joinLines(
    (files || []).map((f) => f.normalized_file_name || f.original_file_name || '')
  );

  const row = [
    toCellValue(application.public_id),
    toCellValue(application.applicant_full_name),
    toCellValue(details.candidate_first_name),
    toCellValue(details.candidate_surname),
    toCellValue(details.date_of_birth),
    toCellValue(`${details.guardian_first_name} ${details.guardian_surname}`),
    toCellValue(details.email),
    toCellValue(details.phone_number),
    toCellValue(examLocationText), // <-- площадка добавлена
    toCellValue(selectedCoursesText),
    toCellValue(formatBool(application.confirmed_id_document_attached)),
    toCellValue(uploadedFilesText),
    toCellValue(formatBool(application.consent_personal_data)),
    toCellValue(formatBool(application.consent_terms)),
    toCellValue(details.review_notes),
    toCellValue(application.status),
    toCellValue(application.submitted_at),
    toCellValue(application.created_at),
  ];

  const spreadsheetId = getEnv('GOOGLE_SHEETS_TEACHERS_SPREADSHEET_ID');
  const sheetName = getEnv('GOOGLE_SHEETS_SECONDARY_SHEET_NAME');
  await appendRow(spreadsheetId, sheetName, row);
}