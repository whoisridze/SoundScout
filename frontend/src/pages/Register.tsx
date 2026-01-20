import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { AuthLayout, FormInput, FormError, Button } from "@/components";
import { useAuth } from "@/contexts";
import type { RegisterFormData } from "@/types";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formState, setFormState] = useState<RegisterFormData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formState.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formState.username) {
      newErrors.username = "Username is required";
    } else if (formState.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formState.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    if (!formState.password) {
      newErrors.password = "Password is required";
    } else if (formState.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formState.password)) {
      newErrors.password = "Password must contain an uppercase letter";
    } else if (!/[a-z]/.test(formState.password)) {
      newErrors.password = "Password must contain a lowercase letter";
    } else if (!/[0-9]/.test(formState.password)) {
      newErrors.password = "Password must contain a number";
    }

    if (!formState.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      await register({
        email: formState.email,
        username: formState.username,
        password: formState.password,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof RegisterFormData) => (value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join SoundScout to discover new music"
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
          id="username"
          label="Username"
          type="text"
          value={formState.username}
          onChange={updateField("username")}
          placeholder="Choose a username"
          error={errors.username}
          autoComplete="username"
          required
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          value={formState.password}
          onChange={updateField("password")}
          placeholder="Create a password"
          error={errors.password}
          autoComplete="new-password"
          required
        />

        <FormInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={formState.confirmPassword}
          onChange={updateField("confirmPassword")}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Create account
          <UserPlus className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-text-secondary mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-primary-400 hover:text-primary-300 font-medium transition-default"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
