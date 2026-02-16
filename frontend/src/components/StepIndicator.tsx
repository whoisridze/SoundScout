import { Link } from "react-router-dom";
import { Check } from "lucide-react";

interface StepIndicatorItem {
  label: string;
  to?: string;
  completed?: boolean;
  active?: boolean;
}

interface StepIndicatorProps {
  steps: StepIndicatorItem[];
}

export default function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-4">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        const stepContent = (
          <div className="flex items-center gap-3">
            {/* Step circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step.completed
                  ? "bg-success-500/20 text-success-400"
                  : step.active
                    ? "bg-primary-500/20 text-primary-400 ring-2 ring-primary-500/30"
                    : "bg-bg-surface text-text-disabled"
              }`}
            >
              {step.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {/* Step label */}
            <span
              className={`text-base font-medium ${
                step.completed
                  ? "text-text-secondary"
                  : step.active
                    ? "text-text-primary"
                    : "text-text-disabled"
              }`}
            >
              {step.label}
            </span>
          </div>
        );

        return (
          <div key={step.label} className="flex items-center gap-4">
            {step.to && step.completed ? (
              <Link
                to={step.to}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {stepContent}
              </Link>
            ) : (
              stepContent
            )}

            {/* Connector line */}
            {!isLast && (
              <div
                className={`w-12 h-px ${
                  step.completed ? "bg-success-500/30" : "bg-border-subtle"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
