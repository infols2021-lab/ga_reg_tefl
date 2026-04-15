import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('teacher_course_catalog')
      .select('id, title, price_kobo')
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (error) throw error;

    return Response.json({
      ok: true,
      data: data.map((c) => ({
        id: c.id,
        title: c.title,
        priceRub: (c.price_kobo || 0) / 100,
      })),
    });
  } catch (e: any) {
    return Response.json(
      {
        ok: false,
        error: { message: e.message || 'Ошибка загрузки курсов' },
      },
      { status: 500 }
    );
  }
}