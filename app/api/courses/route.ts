import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient();

    // Определяем программу из query-параметра ?program=teachers|primary|secondary
    const url = new URL(request.url);
    const program = url.searchParams.get('program') || 'teachers';

    // Маппим программу на допустимые блоки
    const blockMap: Record<string, string[]> = {
      teachers: ['specialization', 'certification', 'diploma'],
      primary: ['primary'],
      secondary: ['secondary'],
    };

    const blocks = blockMap[program] || blockMap.teachers;

    const { data, error } = await supabase
      .from('teacher_course_catalog')
      .select('id, title, price_kobo, block, duration_hours, display_order')
      .eq('is_active', true)
      .in('block', blocks)
      .order('block', { ascending: true })
      .order('display_order', { ascending: true })
      .order('title', { ascending: true });

    if (error) throw error;

    // Порядок блоков
    const blockPriority: Record<string, number> = {
      specialization: 0,
      certification: 1,
      diploma: 2,
      primary: 3,
      secondary: 4,
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
        block: c.block,
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