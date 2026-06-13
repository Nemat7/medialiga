import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { authApi, extractApiError } from "@/api/auth";
import AuthLayout from "@/components/layout/AuthLayout";
import { Phone, ArrowLeft } from "lucide-react";
import { clsx } from "clsx";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setPendingPhone } = useAuth();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.forgotPassword(phone.trim());
      setPendingPhone(data.phone);
      navigate("/reset-password", { state: { expires_in: data.expires_in } });
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
          <h1 className="text-2xl font-bold text-white">{t("auth.forgotTitle")}</h1>
          <p className="text-gray-500 text-sm">{t("auth.forgotSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

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
            {loading ? t("auth.sending") : t("auth.sendCode")}
          </button>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            {t("auth.backToLogin")}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
