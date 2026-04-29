import Link from 'next/link';

const directions = [
  {
    title: 'Начальная школа',
    description: 'Подача заявки для участников направления начальной школы.',
    href: '/apply/schools/primary',
    status: 'Доступно сейчас',
  },
  {
    title: 'Средняя / старшая школа',
    description: 'Подача заявки для участников направления средней и старшей школы.',
    href: '/apply/schools/secondary',
    status: 'Доступно сейчас',
  },
  {
    title: 'Учителя',
    description: 'Многошаговая форма заявки для учителей с загрузкой документов и оплатой.',
    href: '/apply/teachers',
    status: 'Доступно сейчас',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Выберите направление
          </h1>

          <p className="mt-4 text-base text-gray-600">
            Выберите нужный раздел и перейдите к форме заявки.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {directions.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white p-6 shadow"
            >
              <div className="mb-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {item.status}
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                {item.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {item.description}
              </p>

              <Link
                href={item.href}
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-black px-4 text-sm font-medium text-white hover:opacity-90"
              >
                Перейти
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/courses"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Посмотреть цены
          </Link>
        </div>
      </div>
    </main>
  );
}