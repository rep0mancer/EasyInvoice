interface BuilderProgressProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { id: 1, label: 'Client' },
  { id: 2, label: 'Invoice' },
  { id: 3, label: 'Review' },
] as const;

export function BuilderProgress({ currentStep }: BuilderProgressProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                step.id === currentStep
                  ? 'bg-primary text-white'
                  : step.id < currentStep
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step.id}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Step {step.id}
              </p>
              <p className="text-sm font-medium text-slate-700">{step.label}</p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${
                  step.id < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
