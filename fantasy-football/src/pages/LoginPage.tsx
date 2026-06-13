import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { authApi, extractApiError } from "@/api/auth";
import AuthLayout from "@/components/layout/AuthLayout";
import { Eye, EyeOff, Phone, Lock } from "lucide-react";
import { clsx } from "clsx";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { saveAuth, setPendingPhone } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authApi.login(phone.trim(), password);

      if (result.type === "token") {
        saveAuth(result.data.access_token, result.data.user);
        navigate("/dashboard", { replace: true });
      } else {
        setPendingPhone(result.data.phone);
        navigate("/verify", { state: { expires_in: result.data.expires_in } });
      }
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
          <h1 className="text-2xl font-bold text-white">{t("auth.login")}</h1>
          <p className="text-gray-500 text-sm">{t("auth.loginSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {t("auth.phone")}
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("auth.phonePlaceholder")}
                required
                className="w-full bg-gray-900 border border-gray-800 focus:border-green-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {t("auth.password")}
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
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

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Forgot password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              "w-full py-3 rounded-xl font-semibold text-sm transition-colors",
              loading
                ? "bg-green-800 text-green-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-400 text-white"
            )}
          >
            {loading ? t("auth.signingIn") : t("auth.login")}
          </button>
        </form>

        {/* Register hint */}
        <p className="text-center text-xs text-gray-600">
          {t("auth.noAccount")}{" "}
          <span className="text-gray-400">{t("auth.registerInApp")}</span>
        </p>
      </div>
    </AuthLayout>
  );
}
