'use client';

import { Button } from '@/components/ui/button';

function formatPrice(priceRub: number) {
  if (!priceRub || priceRub <= 0) return 'Цена уточняется';
  return new Intl.NumberFormat('ru-RU').format(priceRub) + ' ₽';
}

export default function Step4Payment({ values, totalPriceRub }: any) {
  const qrUrl = process.env.NEXT_PUBLIC_TEACHERS_PAYMENT_QR_URL;

  const candidateFullName = [values.candidateFirstName, values.candidateSurname]
    .filter(Boolean)
    .join(' ')
    .trim();

  const guardianFullName = [values.guardianFirstName, values.guardianSurname]
    .filter(Boolean)
    .join(' ')
    .trim();

  const payerName = guardianFullName || 'Не указан';

  const handleFinish = () => {
    window.location.href = '/apply/schools/primary/success';
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Оплата</h2>
        <p className="mt-2 text-sm text-slate-600">
          Пожалуйста, выполните оплату с помощью QR-кода ниже. После этого ваша заявка будет рассмотрена.
        </p>

        <div className="mt-4 flex justify-center">
          {qrUrl ? (
            <img src={qrUrl} alt="QR-код оплаты" className="h-64 w-64 rounded-xl object-contain" />
          ) : (
            <div className="flex h-64 w-64 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
              QR-код не настроен
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3 text-sm text-slate-700">
          <div>
            <span className="font-medium">Сумма к оплате:</span> {formatPrice(totalPriceRub)}
          </div>
          <div>
            <span className="font-medium">ФИО плательщика:</span> {payerName}
            <p className="text-xs text-slate-500">Законный представитель</p>
          </div>
          <div>
            <span className="font-medium">Назначение платежа:</span>{' '}
            Экзамены GA 6-13 лет за {candidateFullName || 'кандидата'}
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          Сохраните этот QR-код или сделайте скриншот. Откройте его через банковское приложение, укажите точную сумму и ФИО плательщика.
        </div>

        <div className="mt-6">
          <Button onClick={handleFinish} className="w-full">
            Завершить
          </Button>
        </div>
      </div>
    </div>
  );
}