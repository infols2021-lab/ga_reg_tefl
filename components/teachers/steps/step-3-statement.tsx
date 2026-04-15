'use client';

import { Textarea } from '@/components/ui/textarea';

type Props = {
  values: any;
  onChange: (key: string, value: any) => void;
};

function Block({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <h3 className="text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h3>
      {description && (
        <div className="mt-2 text-sm leading-6 text-slate-600">{description}</div>
      )}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-900">
      {children}
      <span className="ml-1 text-rose-500">*</span>
    </label>
  );
}

export default function Step3({ values, onChange }: Props) {
  return (
    <div className="space-y-6">
      <Block
        title="SECTION C: Your Personal Statement"
        description={
          <>
            Please write approximately 500 words outlining
            <br />
            • why you have chosen this teaching course and what you hope to gain from it AND
            <br />
            • what are your current strengths and weaknesses as an English language teacher OR how you consider yourself to be suited to teaching English
            <br />
            <br />
            Please note that use of correct grammar, vocabulary, spelling, and punctuation will all be taken into consideration when considering your application.
          </>
        }
      >
        <FieldLabel>Personal statement</FieldLabel>
        <Textarea
          rows={8}
          value={values.personalStatement || ''}
          onChange={(e) => onChange('personalStatement', e.target.value)}
          placeholder="Write your personal statement here"
          className="min-h-[220px] border-slate-300 text-slate-900 placeholder:text-slate-400"
        />
      </Block>

      <Block
        title="Written Tasks"
        description="Please complete all required written responses."
      >
        <div className="space-y-5">
          <div>
            <FieldLabel>
              A In your opinion, which of the following skills is more difficult to learn: reading or writing? Why?
            </FieldLabel>
            <Textarea
              rows={5}
              value={values.taskAnswerA || ''}
              onChange={(e) => onChange('taskAnswerA', e.target.value)}
              placeholder="Enter your answer"
              className="min-h-[140px] border-slate-300 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <FieldLabel>
              B ‘Can’t’ is the contracted form of ‘cannot’. Why is it important to teach contractions in the English language classroom?
            </FieldLabel>
            <Textarea
              rows={5}
              value={values.taskAnswerB || ''}
              onChange={(e) => onChange('taskAnswerB', e.target.value)}
              placeholder="Enter your answer"
              className="min-h-[140px] border-slate-300 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <FieldLabel>
              C In your opinion, what is the more important aspect of speaking English: fluency or accuracy? Why?
            </FieldLabel>
            <Textarea
              rows={5}
              value={values.taskAnswerC || ''}
              onChange={(e) => onChange('taskAnswerC', e.target.value)}
              placeholder="Enter your answer"
              className="min-h-[140px] border-slate-300 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>
      </Block>
    </div>
  );
}