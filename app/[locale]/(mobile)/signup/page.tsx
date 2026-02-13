'use client';

import { useActionState, useEffect } from 'react';
import { registerUser } from '@/app/lib/auth-actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function SignupPage() {
    const t = useTranslations('SignupPage');
    const [state, action, isPending] = useActionState(registerUser, undefined);
    const router = useRouter();

    useEffect(() => {
        if (state?.success) {
            router.push('/login?message=Registration successful. Please log in.');
        }
    }, [state, router]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm flex flex-col items-center gap-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary-500 mb-2">{t('title')}</h1>
                    <p className="text-gray-500">{t('subtitle')}</p>
                </div>

                <div className="w-full bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <form action={action} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('name_label')}</label>
                            <input
                                name="name"
                                type="text"
                                required
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                            {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email_label')}</label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                            {state?.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password_label')}</label>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                            {state?.errors?.password && <p className="text-red-500 text-xs mt-1">{state.errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirm_password_label')}</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                placeholder="••••••"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                            {state?.errors?.confirmPassword && <p className="text-red-500 text-xs mt-1">{state.errors.confirmPassword}</p>}
                        </div>

                        {state?.message && <p className="text-red-500 text-sm text-center">{state.message}</p>}

                        <button
                            disabled={isPending}
                            type="submit"
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-colors mt-2 disabled:opacity-50"
                        >
                            {isPending ? t('creating_account') : t('sign_up_button')}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {t('existing_account')}{' '}
                        <Link href="/login" className="text-primary-600 font-semibold hover:underline">
                            {t('sign_in_link')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
