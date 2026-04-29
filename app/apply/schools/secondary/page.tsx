import SecondarySchoolForm from '@/components/schools/secondary/secondary-form';

export default function SecondarySchoolApplyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Подростковые и взрослые экзамены ESOL CLASSIC Gatehouse Awards возраст 13+ лет Application
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Подростковые и взрослые экзамены ESOL CLASSIC Gatehouse Awards возраст 13+ лет Registration
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Заполните форму заявки, выберите курсы, загрузите необходимые документы и проверьте их перед отправкой.
          </p>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.10)]">
          <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <SecondarySchoolForm />
          </div>
        </div>
      </div>
    </div>
  );
}