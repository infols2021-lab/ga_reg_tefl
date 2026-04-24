'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Course = {
  id: string;
  title: string;
  priceRub: number;
  block: string;
  durationHours: number;
};

const GROUP_LABELS: Record<string, string> = {
  primary: '6–13 лет (начальная школа)',
  secondary: '13+ лет (средняя / старшая школа)',
  teachers: 'Учителя',
};

const TEACHER_SUBGROUP_LABELS: Record<string, string> = {
  specialization: 'Специализация / Модульные курсы',
  certification: 'Сертификация / TEFL квалификация',
  diploma: 'Диплом / Эквивалент CELTA',
};

const TEACHER_SUBGROUP_ORDER = ['specialization', 'certification', 'diploma'];

function formatPrice(priceRub: number) {
  if (!priceRub || priceRub <= 0) return 'Цена уточняется';
  return new Intl.NumberFormat('ru-RU').format(priceRub) + ' ₽';
}

export default function CoursesCatalogPage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [primaryRes, secondaryRes, teachersRes] = await Promise.all([
          fetch('/api/courses?program=primary'),
          fetch('/api/courses?program=secondary'),
          fetch('/api/courses?program=teachers'),
        ]);
        const primaryData = await primaryRes.json();
        const secondaryData = await secondaryRes.json();
        const teachersData = await teachersRes.json();

        const combined = [
          ...(primaryData.ok ? primaryData.data : []),
          ...(secondaryData.ok ? secondaryData.data : []),
          ...(teachersData.ok ? teachersData.data : []),
        ];
        setAllCourses(combined);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
        Загрузка...
      </div>
    );
  }

  // Группировка
  const groups: Record<string, Course[]> = {
    primary: allCourses.filter((c) => c.block === 'primary'),
    secondary: allCourses.filter((c) => c.block === 'secondary'),
    teachers: allCourses.filter((c) =>
      ['specialization', 'certification', 'diploma'].includes(c.block)
    ),
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Доступные курсы и цены
          </h1>
          <p className="mt-3 text-gray-600">
            Нажмите на категорию, чтобы увидеть список курсов
          </p>
        </div>

        <div className="space-y-4">
          {(['primary', 'secondary', 'teachers'] as const).map((key) => {
            const items = groups[key] || [];
            const isOpen = expanded === key;

            return (
              <div
                key={key}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : key)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-gray-900"
                >
                  <span>{GROUP_LABELS[key]}</span>
                  <span className="text-lg">{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div className="space-y-3 border-t border-gray-100 px-5 py-4">
                    {key === 'teachers' ? (
                      // Учителя с подкатегориями
                      <>
                        {TEACHER_SUBGROUP_ORDER.map((sub) => {
                          const subItems = items.filter((c) => c.block === sub);
                          if (!subItems.length) return null;
                          return (
                            <div key={sub}>
                              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                                {TEACHER_SUBGROUP_LABELS[sub] || sub}
                              </h3>
                              <ul className="space-y-2">
                                {subItems.map((c) => (
                                  <li
                                    key={c.id}
                                    className="flex flex-col rounded-lg bg-gray-50 px-4 py-3 text-sm"
                                  >
                                    <span>{c.title}</span>
                                    <div className="mt-1 flex flex-wrap gap-x-3 text-gray-500">
                                      {c.durationHours > 0 && (
                                        <span>{c.durationHours} ак. ч.</span>
                                      )}
                                      <span className="font-medium text-gray-900">
                                        {formatPrice(c.priceRub)}
                                      </span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      // Школы без подкатегорий
                      <ul className="space-y-2">
                        {items.map((c) => (
                          <li
                            key={c.id}
                            className="flex flex-col rounded-lg bg-gray-50 px-4 py-3 text-sm"
                          >
                            <span>{c.title}</span>
                            <div className="mt-1 flex flex-wrap gap-x-3 text-gray-500">
                              {c.durationHours > 0 && (
                                <span>{c.durationHours} ак. ч.</span>
                              )}
                              <span className="font-medium text-gray-900">
                                {formatPrice(c.priceRub)}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-5 text-sm font-medium text-white hover:opacity-90"
          >
            Вернуться назад
          </Link>
        </div>
      </div>
    </main>
  );
}