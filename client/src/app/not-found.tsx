export const runtime = "edge";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">الصفحة غير موجودة</h2>
      <p className="mb-8 text-gray-600 dark:text-gray-400">عذراً، الصفحة التي تبحث عنها غير موجودة.</p>
      <Link 
        href="/" 
        className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
