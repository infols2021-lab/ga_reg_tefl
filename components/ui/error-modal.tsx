'use client';

export default function ErrorModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Ошибка
        </h3>

        <p className="text-sm text-gray-700 mb-5">
          {message}
        </p>

        <button
          onClick={onClose}
          className="w-full rounded-lg bg-black px-4 py-3 text-white"
        >
          Понятно
        </button>
      </div>
    </div>
  );
}