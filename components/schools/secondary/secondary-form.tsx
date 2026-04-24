'use client';

import { useEffect, useState } from 'react';
import Step1Personal from './steps/step-1-personal';
import Step2CourseFiles from './steps/step-2-course-files';
import Step3Review from './steps/step-3-review';
import Step4Payment from './steps/step-4-payment';
import { Button } from '@/components/ui/button';
import LoadingOverlay from '@/components/ui/loading-overlay';

export default function SecondaryForm() {
  const [step, setStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
    candidateFirstName: '',
    candidateSurname: '',
    dateOfBirth: '',
    guardianFirstName: '',
    guardianSurname: '',
    email: '',
    phone: '',
    selectedCourseIds: [],
    hasUploadedDocument: false,
    confirmedIdDocumentAttached: false,
  });

  function setField(key: string, value: any) {
    setForm((p: any) => ({ ...p, [key]: value }));
  }

  function toggleCourse(id: string) {
    setForm((p: any) => {
      const exists = p.selectedCourseIds.includes(id);
      return {
        ...p,
        selectedCourseIds: exists
          ? p.selectedCourseIds.filter((x: string) => x !== id)
          : [...p.selectedCourseIds, id],
      };
    });
  }

  function validateStep1() {
    return (
      form.candidateFirstName &&
      form.candidateSurname &&
      form.dateOfBirth &&
      form.guardianFirstName &&
      form.guardianSurname &&
      form.email &&
      form.phone
    );
  }

  function validateStep2() {
    return (
      form.selectedCourseIds.length > 0 &&
      form.hasUploadedDocument &&
      form.confirmedIdDocumentAttached
    );
  }

  function validateStep3() {
    return form.consentPersonalData && form.consentTerms;
  }

  async function fetchCourses() {
    const res = await fetch('/api/courses?program=secondary');
    const json = await res.json();
    if (json.ok) setCourses(json.data);
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  async function createApp(): Promise<string> {
    const res = await fetch('/api/applications/secondary/create', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error.message);
    const createdId = json.data.id as string;
    setApplicationId(createdId);
    return createdId;
  }

  async function update(id: string, stepNum: number) {
    const res = await fetch('/api/applications/secondary/update-step', {
      method: 'POST',
      body: JSON.stringify({
        applicationId: id,
        step: stepNum,
        data: form,
      }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error.message);
  }

  async function next() {
    try {
      setIsLoading(true);
      let id = applicationId;
      if (!id) {
        id = await createApp();
      }

      if (step === 1) {
        if (!validateStep1()) throw new Error('Заполни все поля');
        await update(id, 1);
        setStep(2);
      } else if (step === 2) {
        if (!validateStep2()) {
          throw new Error('Выбери хотя бы один курс, загрузи документ и подтверди загрузку');
        }
        await update(id, 2);
        setStep(3);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function submit() {
    try {
      if (!validateStep3()) throw new Error('Подтверди согласия');
      const id = applicationId;
      if (!id) throw new Error('Сначала создайте заявку');

      const confirmed = window.confirm(
        '⚠️ После перехода к оплате редактирование заявки станет невозможным. Убедитесь, что все данные верны.'
      );
      if (!confirmed) return;

      setIsLoading(true);
      await update(id, 3);

      const res = await fetch('/api/applications/secondary/submit', {
        method: 'POST',
        body: JSON.stringify({ applicationId: id }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json?.error?.message || 'Ошибка отправки заявки');

      setStep(4);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  const selectedCourses = courses.filter((c) =>
    form.selectedCourseIds.includes(c.id)
  );
  const totalPriceRub = selectedCourses.reduce((sum, c) => sum + (c.priceRub || 0), 0);
  const showBackButton = step > 1 && step < 4;

  return (
    <div className="mx-auto max-w-4xl p-6">
      {isLoading && <LoadingOverlay text="Сохранение..." />}

      {/* Прогресс-бар */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-2 w-16 rounded-full ${
              step >= s ? 'bg-black' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {step === 1 && <Step1Personal values={form} onChange={setField} />}
      {step === 2 && (
        <Step2CourseFiles
          applicationId={applicationId}
          values={form}
          courses={courses}
          onToggleCourse={toggleCourse}
          onChange={setField}
        />
      )}
      {step === 3 && (
        <Step3Review
          values={form}
          selectedCourses={selectedCourses}
          totalPriceRub={totalPriceRub}
          onChange={setField}
        />
      )}
      {step === 4 && <Step4Payment values={form} totalPriceRub={totalPriceRub} />}

      {showBackButton && (
        <div className="mt-6 flex justify-between">
          <Button disabled={isLoading} onClick={() => setStep(step - 1)}>
            Назад
          </Button>
          {step < 3 ? (
            <Button onClick={next} disabled={isLoading}>
              Далее
            </Button>
          ) : (
            <Button onClick={submit} disabled={isLoading || !form.consentPersonalData || !form.consentTerms}>
              Перейти к оплате
            </Button>
          )}
        </div>
      )}
    </div>
  );
}