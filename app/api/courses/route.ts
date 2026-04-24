import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('teacher_course_catalog')
      .select('id, title, price_kobo, block, duration_hours, display_order')
      .eq('is_active', true)
      .order('block', { ascending: true })
      .order('display_order', { ascending: true })
      .order('title', { ascending: true });

    if (error) throw error;

    // Задаём порядок блоков на случай, если Order By не сработает как ожидается
    const blockPriority: Record<string, number> = {
      specialization: 0,
      certification: 1,
      diploma: 2,
    };

    const sorted = [...(data || [])].sort((a, b) => {
      const pa = blockPriority[a.block] ?? 99;
      const pb = blockPriority[b.block] ?? 99;
      if (pa !== pb) return pa - pb;
      if ((a.display_order ?? 0) !== (b.display_order ?? 0))
        return (a.display_order ?? 0) - (b.display_order ?? 0);
      return (a.title || '').localeCompare(b.title || '');
    });

    return Response.json({
      ok: true,
      data: sorted.map((c) => ({
        id: c.id,
        title: c.title,
        priceRub: (c.price_kobo || 0) / 100,
        block: c.block, // 'specialization' | 'certification' | 'diploma'
        durationHours: c.duration_hours ?? 0,
        displayOrder: c.display_order ?? 0,
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