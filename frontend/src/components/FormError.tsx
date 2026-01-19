import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message: string;
}

export default function FormError({ message }: FormErrorProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-error-500/10 border border-error-500/20 rounded-lg">
      <AlertCircle className="w-5 h-5 text-error-500 shrink-0" />
      <p className="text-sm text-error-400">{message}</p>
    </div>
  );
}
