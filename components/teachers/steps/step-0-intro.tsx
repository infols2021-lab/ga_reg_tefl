'use client';

import { Button } from '@/components/ui/button';

export default function Step0Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Teacher Application
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Как проходит процесс подачи заявки
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Ознакомьтесь с кратким обзором шагов, которые вам предстоит заполнить. 
          Вы сможете вернуться к этому описанию позже.
        </p>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* Шаг 1: Личные данные */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Шаг 1 — Ваши данные
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Заполните основные личные и профессиональные данные: имя, фамилию, дату рождения, 
            адрес, страну, телефон, уровень образования и текущий уровень английского.
          </p>
        </div>

        {/* Шаг 2: Выбор курсов и файлы */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Шаг 2 — Выбор курсов и документы
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Выберите один или несколько курсов из трех блоков:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <strong>Специализация / Модульные курсы</strong> — 
              для повышения квалификации в конкретных областях преподавания (Level 3–5).
            </li>
            <li>
              <strong>Сертификация / TEFL квалификация</strong> — 
              официальное подтверждение ваших навыков (Level 3 и Level 5 Certificate).
            </li>
            <li>
              <strong>Диплом / Эквивалент CELTA</strong> — 
              получение образования, сопоставимого с CELTA (Level 5 Diploma).
            </li>
          </ul>
          <p className="mt-3 text-sm text-slate-500">
            Также загрузите скан удостоверения личности.
          </p>
        </div>

        {/* Шаг 3: Письменные ответы */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Шаг 3 — Персональное заявление и задания
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Напишите мотивационное письмо (около 500 слов) и ответьте на три 
            профессиональных вопроса. Оцениваются грамматика, лексика и стиль.
          </p>
        </div>

        {/* Шаг 4: Проверка */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Шаг 4 — Проверка заявки
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Внимательно проверьте все введённые данные, выбранные курсы и 
            итоговую стоимость. Примите соглашения и подтвердите отправку.
          </p>
          <p className="mt-3 text-sm font-medium text-rose-600">
            После перехода к оплате редактирование станет недоступно.
          </p>
        </div>

        {/* Шаг 5: Оплата */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-950">
            Шаг 5 — Оплата
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            После успешной отправки вы получите QR-код для оплаты через 
            банковское приложение. Следуйте инструкциям, укажите точную сумму 
            и ФИО плательщика.
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