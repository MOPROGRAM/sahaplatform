// Utility functions for Saha Platform

/**
 * Formats a date to relative time (e.g., "منذ دقيقتين", "2 hours ago")
 * @param date - The date to format
 * @param language - Language code ('ar' or 'en')
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: string | Date, language: 'ar' | 'en' = 'en'): string {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInMs = now.getTime() - targetDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (language === 'ar') {
        if (diffInSeconds < 60) {
            return 'منذ لحظات';
        } else if (diffInMinutes < 60) {
            return diffInMinutes === 1 ? 'منذ دقيقة' : `منذ ${diffInMinutes} دقائق`;
        } else if (diffInHours < 24) {
            return diffInHours === 1 ? 'منذ ساعة' : `منذ ${diffInHours} ساعات`;
        } else if (diffInDays < 7) {
            return diffInDays === 1 ? 'منذ يوم' : `منذ ${diffInDays} أيام`;
        } else {
            return targetDate.toLocaleDateString('ar-SA');
        }
    } else {
        if (diffInSeconds < 60) {
            return 'just now';
        } else if (diffInMinutes < 60) {
            return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
        } else if (diffInHours < 24) {
            return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
        } else if (diffInDays < 7) {
            return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
        } else {
            return targetDate.toLocaleDateString('en-US');
        }
    }
}

/**
 * Formats a number with appropriate locale
 * @param number - Number to format
 * @param language - Language code
 * @returns Formatted number string
 */
export function formatNumber(number: number, language: 'ar' | 'en' = 'en'): string {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(number);
}