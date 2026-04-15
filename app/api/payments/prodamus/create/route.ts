import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createProdamusPaymentLink,
  buildDefaultProdamusUrls,
} from '@/lib/payments/prodamus';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.applicationId) {
      return Response.json(
        { ok: false, error: { message: 'Нет applicationId' } },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', body.applicationId)
      .single();

    if (appError || !app) {
      return Response.json(
        { ok: false, error: { message: 'Заявка не найдена' } },
        { status: 404 }
      );
    }

    const { data: courses, error: coursesError } = await supabase
      .from('teacher_application_selected_courses')
      .select(`
        course_id,
        quantity,
        unit_price_kobo,
        title_snapshot
      `)
      .eq('application_id', body.applicationId);

    if (coursesError || !courses?.length) {
      return Response.json(
        { ok: false, error: { message: 'Курсы не найдены' } },
        { status: 400 }
      );
    }

    const products = courses.map((c) => ({
      name: c.title_snapshot || 'Course',
      price: Number((c.unit_price_kobo || 0) / 100),
      quantity: c.quantity || 1,
      type: 'service' as const,
    }));

    const urls = buildDefaultProdamusUrls(body.applicationId);

    const payment = await createProdamusPaymentLink({
      orderId: app.public_id,
      customerEmail: app.applicant_email,
      customerPhone: app.applicant_phone,
      customerExtra: `Application ${app.public_id}`,
      products,
      urlReturn: urls.urlReturn,
      urlSuccess: urls.urlSuccess,
      urlNotification: urls.urlNotification,
    });

    const { error: updateError } = await supabase
      .from('applications')
      .update({
        payment_link: payment.paymentLink,
        payment_order_id: payment.paymentOrderId,
        payment_provider: 'prodamus',
        payment_status: 'payment_link_created',
      })
      .eq('id', app.id);

    if (updateError) throw updateError;

    return Response.json({
      ok: true,
      data: {
        paymentLink: payment.paymentLink,
      },
    });
  } catch (e: any) {
    console.error(e);

    return Response.json(
      {
        ok: false,
        error: { message: e.message || 'Ошибка оплаты' },
      },
      { status: 500 }
    );
  }
}