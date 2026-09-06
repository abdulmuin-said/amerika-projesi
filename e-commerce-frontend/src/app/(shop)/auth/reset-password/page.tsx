/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocalization } from "@/lib/useLocalization";

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t, locale } = useLocalization();

  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError(locale === 'tr' ? 'Şifreler birbiriyle eşleşmiyor' : 'Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      setSuccess(locale === 'tr' ? 'Şifreniz başarıyla güncellendi' : 'Password has been reset successfully');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || (locale === 'tr' ? 'Şifre güncellenemedi. Lütfen tekrar deneyin.' : 'Failed to reset password. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-stone-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-serif text-slate-900">{t("auth.resetPasswordTitle")}</h2>
          <p className="mt-2 text-stone-500">
            {locale === 'tr' ? 'Yeni şifrenizi belirleyin' : 'Enter your new password below'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              {locale === 'tr' ? 'Yeni Şifre' : 'New Password'}
            </label>
            <input
              id="password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
              {locale === 'tr' ? 'Yeni Şifreyi Onaylayın' : 'Confirm New Password'}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-center text-sm text-red-600 font-medium">{error}</div>}
          {success && <div className="text-center text-sm text-emerald-600 font-medium">{success}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white font-semibold shadow-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  {locale === 'tr' ? 'Güncelleniyor...' : 'Resetting...'}
                </span>
              ) : (
                locale === 'tr' ? 'Şifreyi Güncelle' : 'Reset Password'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {locale === 'tr' ? 'Şifrenizi hatırladınız mı?' : 'Remember your password?'}{' '}
          <Link href="/auth/login" className="text-slate-900 font-medium hover:underline">
            {t("auth.signInButton")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-100 via-white to-blue-100 px-4">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"></path>
          </svg>
          <span className="text-indigo-600 font-medium">Loading...</span>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
