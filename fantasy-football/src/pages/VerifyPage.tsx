import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { authApi, extractApiError } from "@/api/auth";
import { useCountdown } from "@/hooks/useCountdown";
import AuthLayout from "@/components/layout/AuthLayout";
import { MessageSquare } from "lucide-react";
import { clsx } from "clsx";

export default function VerifyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingPhone, saveAuth } = useAuth();

  const expiresIn = (location.state as { expires_in?: number } | null)?.expires_in ?? 300;
  const { seconds, isDone, reset } = useCountdown(expiresIn);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Guard: if no pending phone, send back to login
  if (!pendingPhone) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.confirmRegister(pendingPhone, code.trim());
      saveAuth(data.access_token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const data = await authApi.forgotPassword(pendingPhone);
      reset(data.expires_in);
      setError("");
    } catch (err) {
      setError(extractApiError(err));
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
            <MessageSquare size={28} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t("auth.verify")}</h1>
          <p className="text-gray-500 text-sm">
            {t("auth.verifySubtitle")}{" "}
            <span className="text-white font-medium">{pendingPhone}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {t("auth.codeLabel")}
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder={t("auth.codePlaceholder")}
              required
              className="w-full bg-gray-900 border border-gray-800 focus:border-green-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 4}
            className={clsx(
              "w-full py-3 rounded-xl font-semibold text-sm transition-colors",
              loading || code.length < 4
                ? "bg-green-800 text-green-600 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-400 text-white"
            )}
          >
            {loading ? t("auth.confirming") : t("auth.confirm")}
          </button>
        </form>

        {/* Countdown / Resend */}
        <div className="text-center">
          {isDone ? (
            <button
              onClick={handleResend}
              className="text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              {t("auth.resend")}
            </button>
          ) : (
            <p className="text-sm text-gray-600">
              {t("auth.resendIn", { sec: seconds })}
            </p>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
