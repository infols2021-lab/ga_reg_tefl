'use client';

import { Button } from '@/components/ui/button';

type Step5PaymentProps = {
  values: {
    firstName?: string;
    surname?: string;
  };
  totalPriceRub: number;
};

function formatPrice(priceRub: number) {
  if (!priceRub || priceRub <= 0) return 'Цена уточняется';
  return new Intl.NumberFormat('ru-RU').format(priceRub) + ' ₽';
}

export default function Step5Payment({
  values,
  totalPriceRub,
}: Step5PaymentProps) {
  const qrUrl = process.env.NEXT_PUBLIC_TEACHERS_PAYMENT_QR_URL;
  const fullName = [values.firstName || '', values.surname || '']
    .join(' ')
    .trim();

  const handleFinish = () => {
    window.location.href = '/apply/teachers/success';
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Шаг оплаты
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Ваша заявка сохранена
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Пожалуйста, выполните оплату с помощью QR-кода ниже. После этого мы
            проверим вашу заявку вручную.
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <h3 className="text-lg font-semibold text-slate-950">QR-код для оплаты</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Сохраните этот QR-код или сделайте скриншот, затем откройте его
              через ваше банковское приложение.
            </p>

            <div className="mt-5 flex justify-center rounded-3xl border border-slate-200 bg-white p-4">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="QR-код для оплаты"
                  className="h-auto w-full max-w-[320px] rounded-2xl object-contain"
                />
              ) : (
                <div className="flex min-h-[320px] w-full max-w-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 text-center text-sm text-slate-500">
                  Добавьте NEXT_PUBLIC_TEACHERS_PAYMENT_QR_URL, чтобы здесь
                  отображался QR-код для оплаты.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-950">
                Инструкция по оплате
              </h3>

              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-800">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Сумма
                  </span>
                  <span className="mt-1 block text-lg font-semibold text-slate-950">
                    {formatPrice(totalPriceRub)}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    ФИО плательщика
                  </span>
                  <span className="mt-1 block break-words text-slate-950">
                    {fullName || 'Введите ваше полное ФИО вручную'}
                  </span>
                  <p className="mt-2 text-slate-700">
                    В банковском приложении укажите ваше полное ФИО в поле
                    плательщика.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Назначение платежа
                  </span>
                  <span className="mt-1 block break-words text-slate-950">
                    Экзамены по английскому языку
                  </span>
                  <p className="mt-2 text-slate-700">
                    Пожалуйста, укажите именно это назначение платежа в
                    банковском приложении.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5">
              <h3 className="text-lg font-semibold text-amber-950">Важно</h3>
              <div className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
                <p>1. Сохраните этот QR-код или сделайте скриншот перед тем, как покинуть страницу.</p>
                <p>2. Откройте сохранённый QR-код через ваше банковское приложение.</p>
                <p>3. Введите сумму вручную.</p>
                <p>4. Введите ваше полное ФИО вручную.</p>
                <p>5. В поле назначения платежа укажите: Экзамены по английскому языку</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-sm leading-6 text-slate-700">
                Ваша заявка уже сохранена. При необходимости мы свяжемся с вами
                по email, который вы указали в форме.
              </p>
            </div>

            <Button onClick={handleFinish} className="w-full">
              Завершить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}