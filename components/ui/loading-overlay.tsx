'use client';

export default function LoadingOverlay({ text = 'Загрузка...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="rounded-2xl bg-white px-6 py-5 shadow-xl">
        <p className="text-sm font-medium text-gray-900">{text}</p>
      </div>
    </div>
  );
}