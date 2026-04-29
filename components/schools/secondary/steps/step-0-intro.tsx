'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Step0Intro({ onStart }: { onStart: () => void }) {
  const policyLink = process.env.NEXT_PUBLIC_SECONDARY_POLICY_PDF_URL || '#';
  const termsLink = process.env.NEXT_PUBLIC_SECONDARY_TERMS_PDF_URL || '#';

  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Подростковые и взрослые экзамены ESOL CLASSIC Gatehouse Awards возраст 13+ лет Application
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Как проходит процесс подачи заявки
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Ознакомьтесь с алгоритмом заполнения заявки.
        </p>
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <h3 className="text-lg font-semibold text-slate-950">Шаг 1 — Данные кандидата</h3>
          <p className="mt-2 text-sm text-slate-600">
            Заполните ФИО кандидата на английском, дату рождения, а также данные законного представителя, email и телефон.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <h3 className="text-lg font-semibold text-slate-950">Шаг 2 — Выбор курса и документы</h3>
          <p className="mt-2 text-sm text-slate-600">
            Выберите один или несколько курсов из предложенного списка. Загрузите скан документа (паспорт или свидетельство о рождении).
          </p>
          <p className="mt-3">
            <Link href="/courses" className="text-sm font-medium text-indigo-600 underline">
              Посмотреть цены
            </Link>
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <h3 className="text-lg font-semibold text-slate-950">Шаг 3 — Проверка и согласия</h3>
          <p className="mt-2 text-sm text-slate-600">
            Внимательно проверьте все введённые данные, выбранные курсы и итоговую стоимость. Примите согласия и соглашения.
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Рекомендуем заранее ознакомиться с{' '}
            <a href={termsLink} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 underline">
              Договором-офертой
            </a>
            {' '}и{' '}
            <a href={policyLink} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 underline">
              Политикой обработки персональных данных
            </a>.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <h3 className="text-lg font-semibold text-slate-950">Шаг 4 — Оплата</h3>
          <p className="mt-2 text-sm text-slate-600">
            После отправки вы получите QR-код для оплаты. Следуйте инструкциям, укажите точную сумму и ФИО плательщика.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-slate-50/80 px-6 py-5">
        <Button onClick={onStart} className="w-full sm:w-auto">
          Понятно, начать заполнение
        </Button>
      </div>
    </div>
  );
}