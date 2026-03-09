type Step = {
  label: string;
  sublabel: string;
  status: "completed" | "active" | "pending";
};

type Props = {
  steps: Step[];
};

export function ProofTimeline({ steps }: Props) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1">
          {/* Node */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                step.status === "completed"
                  ? "bg-green-500 border-green-500 text-white"
                  : step.status === "active"
                    ? "bg-indigo-500 border-indigo-500 text-white"
                    : "bg-white border-gray-300 text-gray-400"
              }`}
            >
              {step.status === "completed" ? "✓" : i + 1}
            </div>
            <p
              className={`text-xs mt-1 font-medium text-center ${
                step.status === "pending" ? "text-gray-400" : "text-gray-700"
              }`}
            >
              {step.label}
            </p>
            <p className="text-[10px] text-gray-400 text-center">
              {step.sublabel}
            </p>
          </div>
          {/* Connector */}
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-1 ${
                step.status === "completed" ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
