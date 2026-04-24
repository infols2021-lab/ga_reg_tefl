type Step = {
  id: number;
  title: string;
  shortTitle: string;
};

type FormProgressProps = {
  step: number;
  steps?: Step[]; // опциональный набор шагов
};

const defaultSteps: Step[] = [
  { id: 1, title: 'Your Details', shortTitle: 'Детали' },
  { id: 2, title: 'Courses & Files', shortTitle: 'Курсы' },
  { id: 3, title: 'Statements', shortTitle: 'Ответы' },
  { id: 4, title: 'Review & Submit', shortTitle: 'Проверка' },
  { id: 5, title: 'Payment Instructions', shortTitle: 'Оплата' },
];

export default function FormProgress({ step, steps = defaultSteps }: FormProgressProps) {
  return (
    <div className="mb-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Application Progress
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
          Complete the teacher application step by step
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Please move through each section carefully before submitting your application.
        </p>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <div
          className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
            steps.length <= 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-5'
          }`}
        >
          {steps.map((item) => {
            const isActive = step === item.id;
            const isCompleted = step > item.id;

            return (
              <div
                key={item.id}
                className={[
                  'relative min-w-0 overflow-hidden rounded-2xl border px-4 pt-10 pb-4 transition-all',
                  isCompleted
                    ? 'border-slate-950 bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.20)]'
                    : isActive
                    ? 'border-slate-300 bg-slate-50 text-slate-950 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500',
                ].join(' ')}
              >
                <div className="absolute left-3 top-3">
                  <div
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                      isCompleted
                        ? 'bg-white/15 text-white'
                        : isActive
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-100 text-slate-600',
                    ].join(' ')}
                  >
                    {isCompleted ? '✓' : item.id}
                  </div>
                </div>

                <div className="flex min-h-[100px] flex-col items-center justify-center text-center">
                  <div
                    className={[
                      'text-[10px] font-semibold uppercase tracking-[0.18em]',
                      isCompleted
                        ? 'text-slate-300'
                        : isActive
                        ? 'text-slate-500'
                        : 'text-slate-400',
                    ].join(' ')}
                  >
                    Step {item.id}
                  </div>

                  <div
                    className={[
                      'mt-2 text-[16px] font-semibold leading-6',
                      isCompleted || isActive ? 'text-inherit' : 'text-slate-600',
                    ].join(' ')}
                  >
                    <span className="hidden xl:block break-words">{item.title}</span>
                    <span className="block xl:hidden break-words">{item.shortTitle}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}