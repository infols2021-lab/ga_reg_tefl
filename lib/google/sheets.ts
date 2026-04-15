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

export async function appendTeacherRow(
  values: (string | number | boolean | null)[]
) {
  const auth = getAuth();

  const sheets = google.sheets({
    version: 'v4',
    auth,
  });

  const spreadsheetId = getEnv('GOOGLE_SHEETS_TEACHERS_SPREADSHEET_ID');
  const sheetName = getEnv('GOOGLE_SHEETS_TEACHERS_SHEET_NAME');

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });
}

export async function exportTeacherApplicationToSheets(applicationId: string) {
  const supabase = createServerSupabaseClient();

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select(
      `
        id,
        public_id,
        program_type,
        status,
        payment_status,
        payment_provider,
        applicant_email,
        applicant_phone,
        applicant_full_name,
        current_step,
        is_completed,
        consent_personal_data,
        consent_terms,
        confirmed_id_document_attached,
        amount_kobo,
        amount_currency,
        payment_order_id,
        payment_link,
        payment_reference,
        paid_at,
        submitted_at,
        source_system,
        source_path,
        taplink_button,
        created_at,
        updated_at
      `
    )
    .eq('id', applicationId)
    .single();

  if (applicationError || !application) {
    throw new Error('Не удалось получить заявку для выгрузки в Google Sheets.');
  }

  const { data: details, error: detailsError } = await supabase
    .from('teacher_application_details')
    .select(
      `
        first_name,
        surname,
        date_of_birth,
        email,
        address_line,
        country,
        phone_number,
        education_history,
        english_level,
        current_teaching_role,
        teaching_experience,
        personal_statement,
        task_answer_a,
        task_answer_b,
        task_answer_c,
        review_notes
      `
    )
    .eq('application_id', applicationId)
    .single();

  if (detailsError || !details) {
    throw new Error('Не удалось получить детали заявки для Google Sheets.');
  }

  const { data: selectedCourses, error: selectedCoursesError } = await supabase
    .from('teacher_application_selected_courses')
    .select(
      `
        title_snapshot,
        unit_price_kobo,
        quantity,
        currency
      `
    )
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  if (selectedCoursesError) {
    throw new Error('Не удалось получить выбранные курсы для Google Sheets.');
  }

  const { data: files, error: filesError } = await supabase
    .from('application_files')
    .select(
      `
        normalized_file_name,
        original_file_name,
        drive_web_view_link,
        drive_download_link
      `
    )
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
    (files || []).map(
      (file) => file.normalized_file_name || file.original_file_name || ''
    )
  );

  const uploadedFilesLinksText = joinLines(
    (files || []).map(
      (file) => file.drive_web_view_link || file.drive_download_link || ''
    )
  );

  const row: (string | number | boolean | null)[] = [
    toCellValue(application.public_id), // A
    toCellValue(application.applicant_full_name), // B
    toCellValue(details.first_name), // C
    toCellValue(details.surname), // D
    toCellValue(details.email || application.applicant_email), // E
    toCellValue(details.date_of_birth), // F
    toCellValue(details.address_line), // G
    toCellValue(details.country), // H
    toCellValue(details.phone_number || application.applicant_phone), // I
    toCellValue(details.education_history), // J
    toCellValue(details.english_level), // K
    toCellValue(details.current_teaching_role), // L
    toCellValue(details.teaching_experience), // M
    toCellValue(selectedCoursesText), // N
    toCellValue(formatAmountRub(application.amount_kobo)), // O
    toCellValue(application.amount_currency), // P
    toCellValue(uploadedFilesNamesText), // Q
    toCellValue(uploadedFilesLinksText), // R
    toCellValue(details.personal_statement), // S
    toCellValue(details.task_answer_a), // T
    toCellValue(details.task_answer_b), // U
    toCellValue(details.task_answer_c), // V
    toCellValue(details.review_notes), // W
    toCellValue(formatBool(application.consent_personal_data)), // X
    toCellValue(formatBool(application.consent_terms)), // Y
    toCellValue(formatBool(application.confirmed_id_document_attached)), // Z
    toCellValue(application.status), // AA
    toCellValue(application.payment_status), // AB
    toCellValue(application.payment_provider), // AC
    toCellValue(application.payment_order_id), // AD
    toCellValue(application.payment_reference), // AE
    toCellValue(application.payment_link), // AF
    toCellValue(application.submitted_at), // AG
    toCellValue(application.paid_at), // AH
    toCellValue(application.created_at), // AI
    toCellValue(application.updated_at), // AJ
    toCellValue(application.source_system), // AK
    toCellValue(application.source_path), // AL
    toCellValue(application.taplink_button), // AM
    toCellValue(application.program_type), // AN
    toCellValue(application.current_step), // AO
    toCellValue(formatBool(application.is_completed)), // AP
  ];

  await appendTeacherRow(row);
}