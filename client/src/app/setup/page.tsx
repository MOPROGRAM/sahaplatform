'use client';

import { useState } from 'react';
import { apiService } from '@/lib/api';

interface SetupResponse {
    success: boolean;
    message: string;
    data?: {
        countries?: number;
        cities?: number;
        currencies?: number;
        existingCountries?: number;
    };
    error?: string;
}

export default function SetupPage() {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<SetupResponse | null>(null);
    const [error, setError] = useState<string>('');

    const handleSetup = async () => {
        setLoading(true);
        setError('');
        setResponse(null);

        try {
            const result = await fetch('/api/setup-database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data: SetupResponse = await result.json();
            setResponse(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        إعداد قاعدة البيانات
                    </h1>
                    <p className="text-gray-600 mb-6">
                        اضغط على الزر أدناه لتفعيل جميع ميزات الموقع
                    </p>
                </div>

                <div className="space-y-4">
                    {!response && !error && (
                        <button
                            onClick={handleSetup}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                                    جاري الإعداد...
                                </div>
                            ) : (
                                '🚀 تفعيل الموقع'
                            )}
                        </button>
                    )}

                    {response && (
                        <div className={`p-4 rounded-md ${response.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {response.success ? (
                                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="mr-3">
                                    <h3 className={`text-sm font-medium ${response.success ? 'text-green-800' : 'text-red-800'}`}>
                                        {response.success ? 'تم الإعداد بنجاح!' : 'فشل في الإعداد'}
                                    </h3>
                                    <div className={`mt-2 text-sm ${response.success ? 'text-green-700' : 'text-red-700'}`}>
                                        <p>{response.message}</p>
                                        {response.data && (
                                            <ul className="mt-2 list-disc list-inside">
                                                {response.data.countries && <li>{response.data.countries} دولة</li>}
                                                {response.data.cities && <li>{response.data.cities} مدينة</li>}
                                                {response.data.currencies && <li>{response.data.currencies} عملة</li>}
                                                {response.data.existingCountries && <li>القاعدة محدثة مسبقاً</li>}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="mr-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        خطأ في الإعداد
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {response?.success && (
                        <div className="text-center">
                            <a
                                href="/"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                🏠 العودة للصفحة الرئيسية
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}