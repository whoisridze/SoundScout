import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";
import { AuthLayout, FormInput, FormError, Button } from "@/components";
import { useAuth } from "@/contexts";
import type { LoginCredentials } from "@/types";

export default function Login() {
  useEffect(() => { document.title = "Login — SoundScout"; return () => { document.title = "SoundScout"; }; }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = (location.state as { from?: string })?.from || "/dashboard";
  const [formState, setFormState] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!formState.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formState.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(formState);
      navigate(from, { replace: true });
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof LoginCredentials) => (value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue exploring music"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {apiError && <FormError message={apiError} />}

        <FormInput
          id="email"
          label="Email"
          type="email"
          value={formState.email}
          onChange={updateField("email")}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
          required
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          value={formState.password}
          onChange={updateField("password")}
          placeholder="Enter your password"
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Sign in
          <LogIn className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-text-secondary mt-6">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-primary-400 hover:text-primary-300 font-medium transition-default"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
