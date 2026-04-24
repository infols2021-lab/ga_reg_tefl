import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { exportPrimarySchoolApplicationToSheets } from '@/lib/google/sheets';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const applicationId = body.applicationId?.trim();

    if (!applicationId) {
      return NextResponse.json(
        { ok: false, error: { message: 'applicationId обязателен' } },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Проверяем существование заявки
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .single();

    if (appError || !app) {
      return NextResponse.json(
        { ok: false, error: { message: 'Заявка не найдена' } },
        { status: 404 }
      );
    }

    // Вызываем хранимую процедуру submit_primary_application (или просто обновляем статус)
    // Предположим, есть RPC submit_primary_application(p_application_id)
    const { error: submitError } = await supabase.rpc('submit_primary_application', {
      p_application_id: applicationId,
    });

    if (submitError) {
      // Если RPC нет, делаем прямое обновление
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

    // Экспорт в Google Sheets
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
    } catch (exportError: any) {
      console.error('Export error:', exportError);
      await supabase
        .from('applications')
        .update({
          exported_to_google_sheets: false,
          exported_to_google_sheets_at: null,
          google_sheets_export_error: exportError.message || 'Export failed',
        })
        .eq('id', applicationId);
      // Не прерываем процесс отправки
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      {
        ok: false,
        error: { message: e.message || 'Ошибка отправки заявки' },
      },
      { status: 500 }
    );
  }
}