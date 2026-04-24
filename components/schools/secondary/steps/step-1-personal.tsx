'use client';

import { Input } from '@/components/ui/input';

type Props = {
  values: any;
  examLocations: { id: string; label: string }[];
  onChange: (key: string, value: string) => void;
};

export default function Step1Personal({ values, examLocations, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Данные кандидата</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Имя кандидата (на английском)
            </label>
            <Input
              value={values.candidateFirstName || ''}
              onChange={(e) => onChange('candidateFirstName', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Фамилия кандидата (на английском)
            </label>
            <Input
              value={values.candidateSurname || ''}
              onChange={(e) => onChange('candidateSurname', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Дата рождения</label>
            <Input
              type="date"
              value={values.dateOfBirth || ''}
              onChange={(e) => onChange('dateOfBirth', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Данные законного представителя
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Имя представителя</label>
            <Input
              value={values.guardianFirstName || ''}
              onChange={(e) => onChange('guardianFirstName', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Фамилия представителя</label>
            <Input
              value={values.guardianSurname || ''}
              onChange={(e) => onChange('guardianSurname', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              value={values.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Телефон</label>
            <Input
              value={values.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Площадка для сдачи</h2>
        <select
          value={values.examLocationId || ''}
          onChange={(e) => onChange('examLocationId', e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-black focus:ring-2 focus:ring-black/10"
        >
          <option value="">Выберите площадку</option>
          {examLocations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}