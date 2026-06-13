import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { authApi, extractApiError } from "@/api/auth";
import { useCountdown } from "@/hooks/useCountdown";
import AuthLayout from "@/components/layout/AuthLayout";
import { Eye, EyeOff, Lock } from "lucide-react";
import { clsx } from "clsx";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingPhone, saveAuth } = useAuth();

  const expiresIn = (location.state as { expires_in?: number } | null)?.expires_in ?? 300;
  const { seconds, isDone } = useCountdown(expiresIn);

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!pendingPhone) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.resetPassword(pendingPhone, code.trim(), newPassword);
      saveAuth(data.access_token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">{t("auth.resetTitle")}</h1>
          <p className="text-gray-500 text-sm">{t("auth.resetSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SMS Code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {t("auth.codeLabel")}
              </label>
              {!isDone ? (
                <span className="text-xs text-gray-600">{t("auth.resendIn", { sec: seconds })}</span>
              ) : (
                <span className="text-xs text-red-400">Code expired</span>
              )}
            </div>
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

          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {t("auth.newPassword")}
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("auth.newPasswordPlaceholder")}
                minLength={6}
                required
                className="w-full bg-gray-900 border border-gray-800 focus:border-green-600 rounded-xl pl-10 pr-11 py-3 text-white placeholder-gray-600 text-sm focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 4 || newPassword.length < 6}
            className={clsx(
              "w-full py-3 rounded-xl font-semibold text-sm transition-colors",
              loading || code.length < 4 || newPassword.length < 6
                ? "bg-green-800 text-green-600 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-400 text-white"
            )}
          >
            {loading ? t("auth.resetting") : t("auth.resetPassword")}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
