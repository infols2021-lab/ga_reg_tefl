'use client';

import { Textarea } from '@/components/ui/textarea';

function formatPrice(priceRub: number) {
  if (!priceRub || priceRub <= 0) return 'Цена уточняется';
  return new Intl.NumberFormat('ru-RU').format(priceRub) + ' ₽';
}

export default function Step3Review({
  values,
  selectedCourses,
  totalPriceRub,
  onChange,
}: any) {
  const offerLink = process.env.NEXT_PUBLIC_LEGAL_OFFER_URL || '#';
  const pdProcessingLink = process.env.NEXT_PUBLIC_LEGAL_PD_PROCESSING_URL || '#';
  const photoVideoLink = process.env.NEXT_PUBLIC_LEGAL_PHOTO_VIDEO_URL || '#';
  const transborderLink = process.env.NEXT_PUBLIC_LEGAL_TRANSBORDER_URL || '#';

  const isAllSelected = !!(
    values.consentTerms &&
    values.consentPdProcessing &&
    values.consentPhotoVideo &&
    values.consentTransborder
  );

  const handleSelectAll = (checked: boolean) => {
    onChange('consentTerms', checked);
    onChange('consentPdProcessing', checked);
    onChange('consentPhotoVideo', checked);
    onChange('consentTransborder', checked);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Проверка данных</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Кандидат</span>
            <p className="text-sm text-slate-900">
              {values.candidateFirstName} {values.candidateSurname}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Дата рождения</span>
            <p className="text-sm text-slate-900">{values.dateOfBirth}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Представитель</span>
            <p className="text-sm text-slate-900">
              {values.guardianFirstName} {values.guardianSurname}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Email</span>
            <p className="text-sm text-slate-900">{values.email}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase text-slate-500">Телефон</span>
            <p className="text-sm text-slate-900">{values.phone}</p>
          </div>
          {/* Статус документа скрыт */}
        </div>

        <h3 className="mt-6 text-lg font-semibold text-slate-900">Выбранные курсы</h3>
        <div className="mt-2 space-y-2">
          {selectedCourses.map((c: any) => (
            <div key={c.id} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm">
              <span>{c.title}</span>
              <span className="font-medium">{formatPrice(c.priceRub)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between rounded-md bg-black p-3 text-white">
          <span>Итого</span>
          <span className="font-bold">{formatPrice(totalPriceRub)}</span>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Комментарий (необязательно)
          </label>
          <Textarea
            rows={3}
            value={values.reviewNotes || ''}
            onChange={(e) => onChange('reviewNotes', e.target.value)}
            placeholder="Оставьте комментарий, если нужно"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Соглашения и согласия</h3>
        
        <div className="mt-4 space-y-4">
          <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 border border-slate-200">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.currentTarget.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-black"
            />
            <span className="text-sm font-semibold leading-6 text-slate-900">
              Выбрать всё (согласиться со всеми документами)
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={!!values.consentTerms}
              onChange={(e) => onChange('consentTerms', e.currentTarget.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-black"
            />
            <span className="text-sm leading-6 text-slate-700">
              Я подтверждаю, что внимательно изучил(-а) текст{' '}
              <a href={offerLink} target="_blank" className="font-medium text-indigo-600 underline">
                Публичного договора-оферты
              </a>
              , мне понятны все его условия, и я принимаю их без оговорок и в полном объеме.
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={!!values.consentPdProcessing}
              onChange={(e) => onChange('consentPdProcessing', e.currentTarget.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-black"
            />
            <span className="text-sm leading-6 text-slate-700">
              Я ознакомлен и согласен с{' '}
              <a href={pdProcessingLink} target="_blank" className="font-medium text-indigo-600 underline">
                Согласием на обработку и использование персональных данных
              </a>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={!!values.consentPhotoVideo}
              onChange={(e) => onChange('consentPhotoVideo', e.currentTarget.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-black"
            />
            <span className="text-sm leading-6 text-slate-700">
              Я ознакомлен и согласен с{' '}
              <a href={photoVideoLink} target="_blank" className="font-medium text-indigo-600 underline">
                Согласием на использование фото и видео материалов
              </a>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={!!values.consentTransborder}
              onChange={(e) => onChange('consentTransborder', e.currentTarget.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-black"
            />
            <span className="text-sm leading-6 text-slate-700">
              Я ознакомлен и согласен с{' '}
              <a href={transborderLink} target="_blank" className="font-medium text-indigo-600 underline">
                Согласием на трансграничную передачу персональных данных
              </a>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}