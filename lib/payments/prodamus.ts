import crypto from 'node:crypto';

export type ProdamusProduct = {
  name: string;
  price: number;
  quantity: number;
  type?: 'course' | 'service' | 'goods';
};

export type CreateProdamusPaymentInput = {
  orderId: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerExtra?: string | null;
  products: ProdamusProduct[];
  urlReturn?: string | null;
  urlSuccess?: string | null;
  urlNotification?: string | null;
  paymentMethod?: string | null;
  currency?: 'rub' | 'usd' | 'eur' | 'kzt';
  installmentsDisabled?: boolean;
  callbackType?: 'json';
  responseType?: 'json';
  sys?: string | null;
  demoMode?: boolean;
  extraParams?: Record<string, string | number | boolean | null | undefined>;
};

export type CreateProdamusPaymentResult = {
  paymentLink: string;
  paymentOrderId: string;
  requestPayload: Record<string, unknown>;
  responsePayload: unknown;
};

export type VerifyWebhookResult = {
  isVerified: boolean;
  signature: string | null;
};

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Не задана переменная окружения ${name}`);
  }

  return value;
}

function getOptionalEnv(name: string): string | null {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : null;
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortDeep(item));
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(obj).sort()) {
      result[key] = sortDeep(obj[key]);
    }

    return result;
  }

  return value;
}

function stringifyDeep(value: unknown): unknown {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyDeep(item));
  }

  if (typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val !== undefined) {
        result[key] = stringifyDeep(val);
      }
    }

    return sortDeep(result);
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  return String(value);
}

export function createProdamusSignature(
  payload: Record<string, unknown>,
  secretKey: string
): string {
  const normalized = stringifyDeep(payload) as Record<string, unknown>;
  const sorted = sortDeep(normalized);
  const json = JSON.stringify(sorted).replace(/\//g, '\\/');

  return crypto.createHmac('sha256', secretKey).update(json).digest('hex');
}

function appendFormValue(
  searchParams: URLSearchParams,
  prefix: string,
  value: unknown
): void {
  if (value === null || value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendFormValue(searchParams, `${prefix}[${index}]`, item);
    });
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      appendFormValue(searchParams, `${prefix}[${key}]`, val);
    });
    return;
  }

  searchParams.append(prefix, String(value));
}

function toFormUrlEncoded(payload: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    appendFormValue(params, key, value);
  });

  return params;
}

function extractPaymentLink(responseText: string, responseJson: unknown): string | null {
  const asString = normalizeString(responseText);

  if (asString && /^https?:\/\//i.test(asString)) {
    return asString;
  }

  if (responseJson && typeof responseJson === 'object') {
    const obj = responseJson as Record<string, unknown>;
    const candidates = [
      obj.url,
      obj.link,
      obj.payment_url,
      obj.paymentUrl,
      obj.redirect_url,
      obj.redirectUrl,
      obj.data,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate)) {
        return candidate;
      }

      if (candidate && typeof candidate === 'object') {
        const nested = candidate as Record<string, unknown>;
        const nestedCandidates = [
          nested.url,
          nested.link,
          nested.payment_url,
          nested.paymentUrl,
          nested.redirect_url,
          nested.redirectUrl,
        ];

        for (const nestedCandidate of nestedCandidates) {
          if (
            typeof nestedCandidate === 'string' &&
            /^https?:\/\//i.test(nestedCandidate)
          ) {
            return nestedCandidate;
          }
        }
      }
    }
  }

  return null;
}

function getBaseUrl(): string {
  return (
    getOptionalEnv('APP_BASE_URL') ??
    getOptionalEnv('NEXT_PUBLIC_APP_URL') ??
    'http://localhost:3000'
  );
}

export function buildDefaultProdamusUrls(applicationId: string): {
  urlReturn: string;
  urlSuccess: string;
  urlNotification: string;
} {
  const baseUrl = getBaseUrl().replace(/\/$/, '');

  return {
    urlReturn: `${baseUrl}/apply/teachers/fail?applicationId=${encodeURIComponent(applicationId)}`,
    urlSuccess: `${baseUrl}/apply/teachers/success?applicationId=${encodeURIComponent(applicationId)}`,
    urlNotification: `${baseUrl}/api/payments/prodamus/webhook`,
  };
}

export async function createProdamusPaymentLink(
  input: CreateProdamusPaymentInput
): Promise<CreateProdamusPaymentResult> {
  const paymentUrl = getEnv('PRODAMUS_PAYMENT_URL');
  const secretKey = getEnv('PRODAMUS_SECRET_KEY');
  const defaultSys = getOptionalEnv('PRODAMUS_SYS');

  if (!Array.isArray(input.products) || input.products.length === 0) {
    throw new Error('Не переданы товары для оплаты.');
  }

  const payload: Record<string, unknown> = {
    do: 'link',
    products: input.products.map((product) => ({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      ...(product.type ? { type: product.type } : {}),
    })),
    order_id: input.orderId,
    ...(normalizeString(input.customerPhone) ? { customer_phone: input.customerPhone } : {}),
    ...(normalizeString(input.customerEmail) ? { customer_email: input.customerEmail } : {}),
    ...(normalizeString(input.customerExtra) ? { customer_extra: input.customerExtra } : {}),
    ...(normalizeString(input.urlReturn) ? { urlReturn: input.urlReturn } : {}),
    ...(normalizeString(input.urlSuccess) ? { urlSuccess: input.urlSuccess } : {}),
    ...(normalizeString(input.urlNotification) ? { urlNotification: input.urlNotification } : {}),
    ...(normalizeString(input.paymentMethod) ? { payment_method: input.paymentMethod } : {}),
    currency: input.currency ?? 'rub',
    ...(input.installmentsDisabled ? { installments_disabled: 1 } : {}),
    type: input.responseType ?? 'json',
    callbackType: input.callbackType ?? 'json',
    ...(input.demoMode ? { demo_mode: 1 } : {}),
  };

  const sys = normalizeString(input.sys) ?? defaultSys;
  if (sys) {
    payload.sys = sys;
  }

  if (input.extraParams) {
    for (const [key, value] of Object.entries(input.extraParams)) {
      if (value !== undefined && value !== null) {
        payload[key] = value;
      }
    }
  }

  const signature = createProdamusSignature(payload, secretKey);
  const formPayload = toFormUrlEncoded({
    ...payload,
    signature,
  });

  const response = await fetch(paymentUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formPayload.toString(),
    cache: 'no-store',
  });

  const rawText = await response.text();

  let parsedJson: unknown = null;
  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    parsedJson = null;
  }

  if (!response.ok) {
    throw new Error(
      `Prodamus вернул ошибку ${response.status}: ${rawText || 'пустой ответ'}`
    );
  }

  const paymentLink = extractPaymentLink(rawText, parsedJson);

  if (!paymentLink) {
    throw new Error('Не удалось получить ссылку на оплату от Prodamus.');
  }

  return {
    paymentLink,
    paymentOrderId: input.orderId,
    requestPayload: payload,
    responsePayload: parsedJson ?? rawText,
  };
}

function getWebhookSignature(headers: Headers): string | null {
  const candidates = [
    headers.get('signature'),
    headers.get('x-signature'),
    headers.get('x-prodamus-signature'),
    headers.get('http_signature'),
  ];

  for (const value of candidates) {
    const normalized = normalizeString(value);
    if (normalized) return normalized;
  }

  return null;
}

export function verifyProdamusWebhookSignature(
  payload: Record<string, unknown>,
  headers: Headers
): VerifyWebhookResult {
  const secretKey = getEnv('PRODAMUS_SECRET_KEY');
  const incomingSignature = getWebhookSignature(headers);

  if (!incomingSignature) {
    return {
      isVerified: false,
      signature: null,
    };
  }

  const expectedSignature = createProdamusSignature(payload, secretKey);

  const incomingBuffer = Buffer.from(incomingSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (incomingBuffer.length !== expectedBuffer.length) {
    return {
      isVerified: false,
      signature: incomingSignature,
    };
  }

  const isVerified = crypto.timingSafeEqual(incomingBuffer, expectedBuffer);

  return {
    isVerified,
    signature: incomingSignature,
  };
}

export function extractOrderIdFromWebhook(payload: Record<string, unknown>): string | null {
  const candidates: unknown[] = [
    payload.order_id,
    payload.orderId,
    payload.invoice_id,
    payload.invoiceId,
    payload.data,
    payload.payment,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }

    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      const nestedOrderId =
        normalizeString(nested.order_id) ??
        normalizeString(nested.orderId) ??
        normalizeString(nested.invoice_id) ??
        normalizeString(nested.invoiceId);

      if (nestedOrderId) {
        return nestedOrderId;
      }
    }
  }

  return null;
}

export function extractPaymentReferenceFromWebhook(
  payload: Record<string, unknown>
): string | null {
  const candidates: unknown[] = [
    payload.payment_id,
    payload.paymentId,
    payload.transaction,
    payload.transaction_id,
    payload.transactionId,
    payload.id,
    payload.data,
    payload.payment,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }

    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      const nestedValue =
        normalizeString(nested.payment_id) ??
        normalizeString(nested.paymentId) ??
        normalizeString(nested.transaction) ??
        normalizeString(nested.transaction_id) ??
        normalizeString(nested.transactionId) ??
        normalizeString(nested.id);

      if (nestedValue) {
        return nestedValue;
      }
    }
  }

  return null;
}

export function isSuccessfulProdamusWebhook(payload: Record<string, unknown>): boolean {
  const values: string[] = [];

  const collect = (value: unknown): void => {
    if (typeof value === 'string') {
      values.push(value.toLowerCase());
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }

    if (value && typeof value === 'object') {
      Object.values(value as Record<string, unknown>).forEach(collect);
    }
  };

  collect(payload);

  const successMarkers = [
    'success',
    'succeeded',
    'paid',
    'completed',
    'approved',
    'payment_success',
    'payment_succeeded',
  ];

  return values.some((value) => successMarkers.includes(value));
}