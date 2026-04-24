import Link from 'next/link';

export default function PrimarySchoolFailPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
          ⚠️
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Оплата не завершена</h1>
        <p className="mt-3 text-gray-600">
          К сожалению, платёж не был завершён или был отменён.
        </p>
        <p className="mt-2 text-gray-600">
          Вы можете вернуться к заявке и попробовать оплатить снова. Если деньги уже списались, но статус не обновился, свяжитесь с нами.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/apply/schools/primary"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-5 text-sm font-medium text-white hover:opacity-90"
          >
            Вернуться к заявке
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-gray-100 px-5 text-sm font-medium text-gray-900 hover:bg-gray-200"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}