'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

export type ReviewCourseItem = {
  id: string;
  title: string;
  priceRub: number;
};

type Step4ReviewProps = {
  values: any;
  selectedCourses: ReviewCourseItem[];
  totalPriceRub: number;
  onChange: (key: string, value: any) => void;
};

function formatPrice(priceRub: number) {
  if (!priceRub || priceRub <= 0) return 'Цена уточняется';
  return new Intl.NumberFormat('ru-RU').format(priceRub) + ' ₽';
}

function displayValue(value?: string | null) {
  if (!value || !value.trim()) return '—';
  return value;
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="grid min-w-0 gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <span className="break-words text-sm leading-6 text-slate-900">
        {displayValue(value)}
      </span>
    </div>
  );
}

function AgreementCard({
  checked,
  onChange,
  children,
  className = "",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 px-4 py-4 ${className}`}>
      <Checkbox
        checked={checked}
        // Используем onChange и типизируем событие для устранения ошибки TS
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-400 text-slate-900"
      />
      <span className="min-w-0 break-words text-sm leading-6 text-slate-800">
        {children}
      </span>
    </label>
  );
}

export default function Step4Review({
  values,
  selectedCourses,
  totalPriceRub,
  onChange,
}: Step4ReviewProps) {
  const offerLink = process.env.NEXT_PUBLIC_LEGAL_OFFER_URL || '#';
  const pdProcessingLink = process.env.NEXT_PUBLIC_LEGAL_PD_PROCESSING_URL || '#';
  const photoVideoLink = process.env.NEXT_PUBLIC_LEGAL_PHOTO_VIDEO_URL || '#';
  const transborderLink = process.env.NEXT_PUBLIC_LEGAL_TRANSBORDER_URL || '#';

  const isAllSelected = !!(
    values.consentTerms &&
    values.consentPdProcessing &&
    values.consentPhotoVideo &&
    values.consentTransborder
  );

  const handleSelectAll = (checked: boolean) => {
    onChange('consentTerms', checked);
    onChange('consentPdProcessing', checked);
    onChange('consentPhotoVideo', checked);
    onChange('consentTransborder', checked);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Final Step
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Review your application
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Please check your personal details and selected courses carefully before submission.
          </p>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="min-w-0 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <h3 className="text-lg font-semibold text-slate-950">
                SECTION A: Your Details
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ReviewItem label="First name(s)" value={values.firstName} />
                <ReviewItem label="Surname" value={values.surname} />
                <ReviewItem label="Date of birth" value={values.dateOfBirth} />
                <ReviewItem label="Email" value={values.email} />
                <ReviewItem label="Address" value={values.addressLine} />
                <ReviewItem label="Country" value={values.country} />
                <ReviewItem label="Phone number" value={values.phoneNumber} />
                <ReviewItem label="English level" value={values.englishLevel} />
                <ReviewItem label="Current teaching role" value={values.currentTeachingRole} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-950">
                Comment to the application
              </h3>
              <div className="mt-4">
                <Textarea
                  rows={5}
                  value={values.reviewNotes || ''}
                  onChange={(e) => onChange('reviewNotes', e.target.value)}
                  placeholder="Write an optional comment"
                  className="min-h-[150px] border-slate-300 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <h3 className="text-lg font-semibold text-slate-950">
                SECTION B: Selected Courses
              </h3>

              <div className="mt-4 space-y-3">
                {selectedCourses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                    No courses selected yet.
                  </div>
                ) : (
                  selectedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 break-words text-sm leading-6 text-slate-900">
                          {course.title}
                        </div>
                        <div className="shrink-0 text-sm font-semibold text-slate-950">
                          {formatPrice(course.priceRub)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 rounded-2xl bg-slate-950 px-5 py-5 text-white shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-300">Total price</span>
                  <span className="text-2xl font-semibold">
                    {formatPrice(totalPriceRub)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-950">
                Agreements and confirmations
              </h3>

              <div className="mt-4 space-y-4">
                <AgreementCard
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="bg-slate-100 font-semibold"
                >
                  Select all agreements and confirmations
                </AgreementCard>

                <AgreementCard
                  checked={!!values.consentTerms}
                  onChange={(checked) => onChange('consentTerms', checked)}
                  className="bg-slate-50"
                >
                  Я подтверждаю, что внимательно изучил(-а) текст{' '}
                  <a
                    href={offerLink}
                    target="_blank"
                    rel="noreferrer"
                    className="break-words font-medium text-slate-950 underline underline-offset-4"
                  >
                    Публичного договора-оферты
                  </a>
                  , мне понятны все его условия, и я принимаю их без оговорок и в полном объеме.
                </AgreementCard>

                <AgreementCard
                  checked={!!values.consentPdProcessing}
                  onChange={(checked) => onChange('consentPdProcessing', checked)}
                  className="bg-slate-50"
                >
                  I agree to the{' '}
                  <a
                    href={pdProcessingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="break-words font-medium text-slate-950 underline underline-offset-4"
                  >
                    Personal Data Processing Policy
                  </a>.
                </AgreementCard>

                <AgreementCard
                  checked={!!values.consentPhotoVideo}
                  onChange={(checked) => onChange('consentPhotoVideo', checked)}
                  className="bg-slate-50"
                >
                  I agree to the{' '}
                  <a
                    href={photoVideoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="break-words font-medium text-slate-950 underline underline-offset-4"
                  >
                    Photo and Video Materials Usage Policy
                  </a>.
                </AgreementCard>

                <AgreementCard
                  checked={!!values.consentTransborder}
                  onChange={(checked) => onChange('consentTransborder', checked)}
                  className="bg-slate-50"
                >
                  I agree to the{' '}
                  <a
                    href={transborderLink}
                    target="_blank"
                    rel="noreferrer"
                    className="break-words font-medium text-slate-950 underline underline-offset-4"
                  >
                    Cross-border Personal Data Transfer Policy
                  </a>.
                </AgreementCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}