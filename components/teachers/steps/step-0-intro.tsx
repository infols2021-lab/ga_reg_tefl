'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Step0Intro({ onStart }: { onStart: () => void }) {
  const policyLink = process.env.NEXT_PUBLIC_TEACHERS_POLICY_PDF_URL || '#';
  const termsLink = process.env.NEXT_PUBLIC_TEACHERS_TERMS_PDF_URL || '#';

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
          <p className="mt-3">
            <Link href="/courses" className="text-sm font-medium text-indigo-600 underline">
              Посмотреть цены
            </Link>
          </p>
        </div>

        {/* Шаг 3: Подробное описание SECTION C */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Шаг 3 — Персональное заявление и письменные задания
          </h3>
          
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <div>
              <p className="font-medium text-slate-800">SECTION C: Your Personal Statement</p>
              <p>
                Напишите примерно 500 слов, объяснив:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>почему вы выбрали этот курс и что надеетесь получить;</li>
                <li>ваши текущие сильные и слабые стороны как преподавателя английского языка ИЛИ почему вы считаете себя подходящим для преподавания английского.</li>
              </ul>
              <p className="mt-2 text-xs text-slate-500">
                Обратите внимание: грамматика, словарный запас, орфография и пунктуация будут учитываться при рассмотрении вашей заявки.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <p className="font-medium text-slate-800">Pre-enrolment tasks</p>
              <p>
                На каждый из трёх вопросов напишите 120–150 слов:
              </p>
              <ol className="list-decimal pl-5 mt-1 space-y-2">
                <li>
                  <span className="font-medium">A. Reading vs Writing.</span> Какое умение, по вашему мнению, сложнее освоить: чтение или письмо? Почему?
                </li>
                <li>
                  <span className="font-medium">B. Contractions.</span> ‘Can’t’ — сокращённая форма ‘cannot’. Почему важно обучать сокращениям на уроках английского языка?
                </li>
                <li>
                  <span className="font-medium">C. Fluency vs Accuracy.</span> Что важнее при говорении на английском: беглость или точность? Почему?
                </li>
              </ol>
              <p className="mt-2 text-xs text-slate-500">
                Ваши ответы также оцениваются по качеству языка и аргументации.
              </p>
            </div>
          </div>
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