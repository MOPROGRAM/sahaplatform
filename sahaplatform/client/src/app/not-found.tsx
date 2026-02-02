// export const runtime = 'edge';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-200">ط·آ§ط¸â€‍ط·آµط¸ظ¾ط·آ­ط·آ© ط·ط›ط¸ظ¹ط·آ± ط¸â€¦ط¸ث†ط·آ¬ط¸ث†ط·آ¯ط·آ©</h2>
      <p className="mb-8 text-gray-600 dark:text-gray-400">ط·آ¹ط·آ°ط·آ±ط·آ§ط¸â€¹ط·إ’ ط·آ§ط¸â€‍ط·آµط¸ظ¾ط·آ­ط·آ© ط·آ§ط¸â€‍ط·ع¾ط¸ظ¹ ط·ع¾ط·آ¨ط·آ­ط·آ« ط·آ¹ط¸â€ ط¸â€،ط·آ§ ط·ط›ط¸ظ¹ط·آ± ط¸â€¦ط¸ث†ط·آ¬ط¸ث†ط·آ¯ط·آ©.</p>
      <Link 
        href="/" 
        className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
      >
        ط·آ§ط¸â€‍ط·آ¹ط¸ث†ط·آ¯ط·آ© ط¸â€‍ط¸â€‍ط·آ±ط·آ¦ط¸ظ¹ط·آ³ط¸ظ¹ط·آ©
      </Link>
    </div>
  );
}