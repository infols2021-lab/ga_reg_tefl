'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

type Props = {
  values: any;
  onChange: (key: string, value: string) => void;
};

function Label({
  children,
  required = true,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-900">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

function FieldCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export default function Step1Personal({ values, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Teacher Application
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            SECTION A: Your Details
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Please complete all personal and professional details carefully.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldCard>
              <Label>First name(s)</Label>
              <Input
                value={values.firstName || ''}
                onChange={(e) => onChange('firstName', e.target.value)}
                placeholder="Enter your first name(s)"
                className="border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
            </FieldCard>

            <FieldCard>
              <Label>Surname</Label>
              <Input
                value={values.surname || ''}
                onChange={(e) => onChange('surname', e.target.value)}
                placeholder="Enter your surname"
                className="border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
              <p className="mt-2 text-xs text-slate-500">(family name)</p>
            </FieldCard>

            <FieldCard>
              <Label>Date of birth</Label>
              <Input
                type="date"
                value={values.dateOfBirth || ''}
                onChange={(e) => onChange('dateOfBirth', e.target.value)}
                className="border-slate-300 text-slate-900"
              />
              <p className="mt-2 text-xs text-slate-500">(dd/mm/yyyy)</p>
            </FieldCard>

            <FieldCard>
              <Label>Email address</Label>
              <Input
                type="email"
                value={values.email || ''}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="name@example.com"
                className="border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
            </FieldCard>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3">
            <p className="text-sm leading-6 text-amber-900">
              Please note: your name in full as provided above must also match
              your ID. Your email address will be used throughout the application
              process, so please make sure it is correct.
            </p>
          </div>

          <FieldCard>
            <Label>Your address</Label>
            <Textarea
              rows={4}
              value={values.addressLine || ''}
              onChange={(e) => onChange('addressLine', e.target.value)}
              placeholder="Enter your full address"
              className="min-h-[120px] border-slate-300 text-slate-900 placeholder:text-slate-400"
            />
          </FieldCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldCard>
              <Label>Country</Label>
              <Input
                value={values.country || ''}
                onChange={(e) => onChange('country', e.target.value)}
                placeholder="Enter your country"
                className="border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
            </FieldCard>

            <FieldCard>
              <Label>Phone number</Label>
              <Input
                value={values.phoneNumber || ''}
                onChange={(e) => onChange('phoneNumber', e.target.value)}
                placeholder="Enter your phone number"
                className="border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
            </FieldCard>
          </div>

          <FieldCard>
            <Label>Education history</Label>
            <Textarea
              rows={5}
              value={values.educationHistory || ''}
              onChange={(e) => onChange('educationHistory', e.target.value)}
              placeholder="Please give a brief overview of your previous education, including your highest level qualifications to date"
              className="min-h-[140px] border-slate-300 text-slate-900 placeholder:text-slate-400"
            />
          </FieldCard>

          <FieldCard>
            <Label>Current level of English language proficiency</Label>
            <Select
              value={values.englishLevel || ''}
              onChange={(e) => onChange('englishLevel', e.target.value)}
              className="border-slate-300 text-slate-900"
            >
              <option value="">Select level</option>
              <option value="b2">B2</option>
              <option value="c1">C1</option>
              <option value="c2">C2</option>
            </Select>
          </FieldCard>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm leading-6 text-slate-700">
              The following two questions are only for candidates with current
              and / or previous teaching experience.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FieldCard className="h-full">
              <Label required={false}>Current teaching role</Label>
              <Input
                value={values.currentTeachingRole || ''}
                onChange={(e) => onChange('currentTeachingRole', e.target.value)}
                placeholder="Describe your current teaching role"
                className="border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
            </FieldCard>

            <FieldCard className="h-full">
              <Label required={false}>Your teaching experience to date</Label>
              <Textarea
                rows={5}
                value={values.teachingExperience || ''}
                onChange={(e) => onChange('teachingExperience', e.target.value)}
                placeholder="Describe your teaching experience to date"
                className="min-h-[140px] border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
            </FieldCard>
          </div>
        </div>
      </div>
    </div>
  );
}