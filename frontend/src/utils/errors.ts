import axios from "axios";

/**
 * Extract a human-readable error message from an Axios error or unknown error.
 * Handles FastAPI string details and Pydantic validation error arrays.
 */
export function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const msg: string = detail[0].msg || fallback;
      const cleaned = msg
        .replace(/^Value error,\s*/i, "")
        .replace(/^value is not a valid email address:\s*/i, "Invalid email: ");
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }
  return fallback;
}
