'use client';

import SchoolFileUpload from '@/components/schools/school-file-upload';

function formatPrice(priceRub: number) {
  if (!priceRub || priceRub <= 0) return 'Цена уточняется';
  return new Intl.NumberFormat('ru-RU').format(priceRub) + ' ₽';
}

export default function Step2CourseFiles({
  applicationId,
  values,
  courses,
  onToggleCourse,
  onChange,
}: any) {
  const selected = values.selectedCourseIds || [];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Выбор курса</h2>
          <p className="mt-1 text-sm text-slate-500">Выберите один или несколько курсов</p>
        </div>
        <div className="max-h-[420px] space-y-3 overflow-y-auto p-4">
          {courses.map((course: any) => {
            const checked = selected.includes(course.id);
            return (
              <label
                key={course.id}
                className={`block cursor-pointer rounded-xl border px-4 py-3 transition ${
                  checked
                    ? 'border-black bg-black text-white'
                    : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="break-words text-sm font-medium leading-6">{course.title}</div>
                    <div className="mt-1 text-sm">
                      <span className={checked ? 'text-white/80' : 'text-slate-500'}>
                        {formatPrice(course.priceRub || 0)}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleCourse(course.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-black"
                  />
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Документы</h2>
          <p className="mt-1 text-sm text-slate-500">
            Загрузите скан паспорта или свидетельства о рождении кандидата
          </p>
        </div>
        <div className="space-y-4 p-5">
          <SchoolFileUpload
            applicationId={applicationId}
            programType="secondary"
            onUploaded={() => onChange('hasUploadedDocument', true)}
            onFilesChange={(count: number) => {
              onChange('hasUploadedDocument', count > 0);
              if (count === 0) onChange('confirmedIdDocumentAttached', false);
            }}
          />
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              checked={!!values.confirmedIdDocumentAttached}
              onChange={(e) => onChange('confirmedIdDocumentAttached', e.currentTarget.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-black"
            />
            <span className="text-sm leading-6 text-slate-800">
              Я подтверждаю, что документ загружен
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}