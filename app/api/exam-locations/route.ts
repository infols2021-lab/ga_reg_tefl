import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('exam_locations')
      .select('id, city, exam_date')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('exam_date', { ascending: true });

    if (error) throw error;

    return Response.json({
      ok: true,
      data: (data || []).map((loc) => ({
        id: loc.id,
        label: `${loc.city} — ${new Date(loc.exam_date).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}`,
        city: loc.city,
        examDate: loc.exam_date,
      })),
    });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: { message: e.message || 'Ошибка загрузки площадок' } },
      { status: 500 }
    );
  }
}