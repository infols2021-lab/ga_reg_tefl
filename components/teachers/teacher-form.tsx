'use client';

import { useEffect, useState } from 'react';
import Step0Intro from './steps/step-0-intro';
import Step1 from './steps/step-1-personal';
import Step2 from './steps/step-2-course-files';
import Step3 from './steps/step-3-statement';
import Step4 from './steps/step-4-review';
import Step5 from './steps/step-5-payment';
import FormProgress from './form-progress';
import { Button } from '@/components/ui/button';
import LoadingOverlay from '@/components/ui/loading-overlay';

export default function TeacherForm() {
  const [step, setStep] = useState(0); // начинаем с 0 (инструкция)
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
    selectedCourseIds: [],
    hasUploadedDocument: false,
    confirmedIdDocumentAttached: false,
    consentTerms: false,
    consentPdProcessing: false,
    consentPdDistribution: false,
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
      form.firstName &&
      form.surname &&
      form.email &&
      form.dateOfBirth &&
      form.addressLine &&
      form.country &&
      form.phoneNumber &&
      form.educationHistory &&
      form.englishLevel
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
    return (
      form.personalStatement &&
      form.taskAnswerA &&
      form.taskAnswerB &&
      form.taskAnswerC
    );
  }

  function validateStep4() {
    return (
      form.consentTerms &&
      form.consentPdProcessing &&
      form.consentPdDistribution
    );
  }

  async function fetchCourses() {
    const res = await fetch('/api/courses');
    const json = await res.json();
    if (json.ok) setCourses(json.data);
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  async function createApp(): Promise<string> {
    const res = await fetch('/api/applications/teachers/create', {
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
    const res = await fetch('/api/applications/teachers/update-step', {
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
        if (!form.selectedCourseIds.length && !form.hasUploadedDocument) {
          throw new Error(
            'Выбери хотя бы один курс, загрузи документ и подтверди загрузку'
          );
        }

        if (!form.selectedCourseIds.length) {
          throw new Error('Выбери хотя бы один курс');
        }

        if (!form.hasUploadedDocument) {
          throw new Error('Сначала загрузи документ');
        }

        if (!form.confirmedIdDocumentAttached) {
          throw new Error('Подтверди, что документ загружен');
        }

        await update(id, 2);
        setStep(3);
      } else if (step === 3) {
        if (!validateStep3()) throw new Error('Заполни всё');
        await update(id, 3);
        setStep(4);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit() {
    try {
      if (!validateStep4()) throw new Error('Подтверди согласия');

      // Подтверждение финальной отправки
      const confirmed = window.confirm(
        '⚠️ После перехода на этап оплаты вы больше не сможете редактировать данные заявки.\n\nУбедитесь, что вся информация введена верно.'
      );
      if (!confirmed) return;

      const id = applicationId;
      if (!id) throw new Error('Сначала создайте заявку');

      setIsLoading(true);

      await update(id, 4);

      const res = await fetch('/api/applications/teachers/submit', {
        method: 'POST',
        body: JSON.stringify({ applicationId: id }),
      });

      const json = await res.json();

      if (!json.ok) {
        throw new Error(json?.error?.message || 'Ошибка отправки заявки');
      }

      setStep(5);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  const selectedCourses = courses.filter((c) =>
    form.selectedCourseIds.includes(c.id)
  );

  const totalPriceRub = selectedCourses.reduce(
    (sum, c) => sum + (c.priceRub || 0),
    0
  );

  const isSubmitDisabled =
    step === 4 &&
    (!form.consentTerms ||
      !form.consentPdProcessing ||
      !form.consentPdDistribution);

  // Кнопка "Назад" скрыта на шагах 0 и 5
  const showBackButton = step > 0 && step < 5;

  return (
    <div className="mx-auto max-w-4xl p-6">
      {isLoading && <LoadingOverlay text="Сохранение..." />}

      {step > 0 && <FormProgress step={step} />}

      {step === 0 && <Step0Intro onStart={() => setStep(1)} />}

      {step === 1 && <Step1 values={form} onChange={setField} />}

      {step === 2 && (
        <Step2
          applicationId={applicationId}
          values={form}
          courses={courses}
          onToggleCourse={toggleCourse}
          onChange={setField}
        />
      )}

      {step === 3 && <Step3 values={form} onChange={setField} />}

      {step === 4 && (
        <Step4
          values={form}
          selectedCourses={selectedCourses}
          totalPriceRub={totalPriceRub}
          onChange={setField}
        />
      )}

      {step === 5 && (
        <Step5
          values={form}
          totalPriceRub={totalPriceRub}
        />
      )}

      {showBackButton && (
        <div className="mt-6 flex justify-between">
          <Button
            disabled={isLoading}
            onClick={() => setStep(step - 1)}
          >
            Назад
          </Button>

          {step < 4 ? (
            <Button onClick={next} disabled={isLoading}>
              Далее
            </Button>
          ) : step === 4 ? (
            <Button onClick={handleSubmit} disabled={isLoading || isSubmitDisabled}>
              Сохранить и перейти к оплате
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}