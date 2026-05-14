'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Step0Intro({ onStart }: { onStart: () => void }) {
  // Используем общие ENV для всех типов заявок
  const offerLink = process.env.NEXT_PUBLIC_LEGAL_OFFER_URL || '#';
  const pdProcessingLink = process.env.NEXT_PUBLIC_LEGAL_PD_PROCESSING_URL || '#';
  const transborderLink = process.env.NEXT_PUBLIC_LEGAL_TRANSBORDER_URL || '#';
  const photoVideoLink = process.env.NEXT_PUBLIC_LEGAL_PHOTO_VIDEO_URL || '#';

  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Экзамены для детей Cadets Gatehouse Awards возраст 6-13 лет Application
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
          <h3 className="text-lg font-semibold text-slate-950">Шаг 2 — Выбор курса</h3>
          <p className="mt-2 text-sm text-slate-600">
            Выберите один или несколько курсов из предложенного списка. 
            {/* Описание загрузки документов скрыто */}
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
            Внимательно проверьте все введённые данные и выбранные курсы. Вам потребуется подтвердить:
          </p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>
              • <a href={offerLink} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 underline">
                Публичный договор-оферты
              </a>
            </p>
            <p>
              • <a href={pdProcessingLink} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 underline">
                Согласие на обработку персональных данных
              </a>
            </p>
            <p>
              • <a href={transborderLink} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 underline">
                Согласие на трансграничную передачу персональных данных
              </a>
            </p>
            <p>
              • <a href={photoVideoLink} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 underline">
                Согласие на использование фото и видео
              </a>
            </p>
          </div>
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