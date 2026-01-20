// Utility functions for Saha Platform

import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * Formats a date to relative time (e.g., "منذ دقيقتين", "2 hours ago")
 * @param date - The date to format
 * @param language - Language code ('ar' or 'en')
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: string | Date, language: 'ar' | 'en' = 'en'): string {
    const targetDate = new Date(date);

    if (language === 'ar') {
        return formatDistanceToNow(targetDate, {
            addSuffix: true,
            locale: ar
        });
    } else {
        return formatDistanceToNow(targetDate, {
            addSuffix: true
        });
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