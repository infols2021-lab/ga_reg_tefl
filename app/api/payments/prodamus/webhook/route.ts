import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  extractOrderIdFromWebhook,
  extractPaymentReferenceFromWebhook,
  isSuccessfulProdamusWebhook,
  verifyProdamusWebhookSignature,
} from '@/lib/payments/prodamus';

export const runtime = 'nodejs';

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status });
}

async function readWebhookPayload(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return (await request.json()) as Record<string, unknown>;
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const payload: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      payload[key] = typeof value === 'string' ? value : value.name;
    }

    return payload;
  }

  const rawText = await request.text();

  try {
    return JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    return {
      raw: rawText,
    };
  }
}

export async function POST(request: Request): Promise<Response> {
  const supabase = createServerSupabaseClient();

  try {
    const payload = await readWebhookPayload(request);

    const verification = verifyProdamusWebhookSignature(payload, request.headers);
    const orderId = extractOrderIdFromWebhook(payload);
    const paymentReference = extractPaymentReferenceFromWebhook(payload);

    let applicationId: string | null = null;

    if (orderId) {
      const { data: app } = await supabase
        .from('applications')
        .select('id, public_id, status, payment_status')
        .eq('payment_order_id', orderId)
        .maybeSingle();

      if (app?.id) {
        applicationId = app.id;
      } else {
        const { data: appByPublicId } = await supabase
          .from('applications')
          .select('id, public_id, status, payment_status')
          .eq('public_id', orderId)
          .maybeSingle();

        if (appByPublicId?.id) {
          applicationId = appByPublicId.id;
        }
      }
    }

    await supabase.from('payment_events').insert({
      application_id: applicationId,
      provider: 'prodamus',
      event_type: 'webhook',
      order_id: orderId,
      payment_reference: paymentReference,
      is_verified: verification.isVerified,
      verification_error: verification.isVerified ? null : 'Неверная подпись webhook',
      request_headers: Object.fromEntries(request.headers.entries()),
      payload,
    });

    if (!verification.isVerified) {
      return jsonResponse(400, {
        ok: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Подпись webhook не прошла проверку.',
        },
      });
    }

    if (!applicationId) {
      return jsonResponse(200, {
        ok: true,
        data: {
          processed: false,
          message: 'Webhook принят, но заявка не найдена.',
        },
      });
    }

    const isPaid = isSuccessfulProdamusWebhook(payload);

    if (!isPaid) {
      await supabase
        .from('applications')
        .update({
          payment_status: 'pending',
        })
        .eq('id', applicationId);

      return jsonResponse(200, {
        ok: true,
        data: {
          processed: true,
          applicationId,
          paymentStatus: 'pending',
        },
      });
    }

    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status: 'paid',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        payment_reference: paymentReference,
        payment_last_error: null,
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('applications.update webhook paid error:', updateError);

      return jsonResponse(500, {
        ok: false,
        error: {
          code: 'APPLICATION_UPDATE_FAILED',
          message: 'Webhook принят, но не удалось обновить статус заявки.',
        },
      });
    }

    return jsonResponse(200, {
      ok: true,
      data: {
        processed: true,
        applicationId,
        paymentStatus: 'paid',
      },
    });
  } catch (error) {
    console.error('POST /api/payments/prodamus/webhook error:', error);

    return jsonResponse(500, {
      ok: false,
      error: {
        code: 'WEBHOOK_PROCESSING_FAILED',
        message: 'Не удалось обработать webhook.',
      },
    });
  }
}