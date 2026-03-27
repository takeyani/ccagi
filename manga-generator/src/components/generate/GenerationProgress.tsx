"use client";

interface ProgressStep {
  label: string;
  status: "pending" | "processing" | "completed" | "failed";
  detail?: string;
}

interface Props {
  steps: ProgressStep[];
  currentStep: number;
}

export default function GenerationProgress({ steps, currentStep }: Props) {
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.max(progress, currentStep > 0 ? 10 : 5)}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className={`flex items-start gap-3 ${i > currentStep && step.status === "pending" ? "opacity-40" : ""}`}>
            {/* Icon */}
            <div className="mt-0.5">
              {step.status === "completed" ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              ) : step.status === "processing" ? (
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-sm animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              ) : step.status === "failed" ? (
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-xs text-slate-400 font-medium">{i + 1}</span>
                </div>
              )}
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-medium ${
                step.status === "completed" ? "text-emerald-700" :
                step.status === "processing" ? "text-indigo-700" :
                step.status === "failed" ? "text-red-700" :
                "text-slate-400"
              }`}>
                {step.label}
              </span>
              {step.detail && step.status === "processing" && (
                <p className="text-xs text-slate-400 mt-0.5 truncate">{step.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
