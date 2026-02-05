"use client";

import { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { pushNotificationService } from '@/lib/push-notifications';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguage } from '@/lib/language-context';

export default function PushNotificationToggle() {
  const { user } = useAuthStore();
  const { language, t } = useLanguage();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = await pushNotificationService.initialize();
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        const subscription = await pushNotificationService.getSubscription();
        setIsSubscribed(!!subscription);
      }
    };
    checkSupport();
  }, []);

  const handleToggle = async () => {
    if (!user) {
      setError(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSubscribed) {
        // Unsubscribe
        const unsubscribed = await pushNotificationService.unsubscribe();
        if (unsubscribed) {
          await pushNotificationService.removeSubscriptionFromServer(user.id);
          setIsSubscribed(false);
          setSuccess(language === 'ar' ? 'تم إيقاف الإشعارات' : 'Notifications disabled');
        } else {
          setError(language === 'ar' ? 'فشل إيقاف الإشعارات' : 'Failed to disable notifications');
        }
      } else {
        // Subscribe
        const newPermission = await pushNotificationService.requestPermission();
        setPermission(newPermission);

        if (newPermission === 'granted') {
          const subscription = await pushNotificationService.subscribe();
          if (subscription) {
            const sent = await pushNotificationService.sendSubscriptionToServer(subscription, user.id);
            if (sent) {
              setIsSubscribed(true);
              setSuccess(language === 'ar' ? 'تم تفعيل الإشعارات بنجاح' : 'Notifications enabled successfully');
            } else {
              setError(language === 'ar' ? 'فشل حفظ الاشتراك' : 'Failed to save subscription');
            }
          } else {
            setError(language === 'ar' ? 'فشل الاشتراك في الإشعارات' : 'Failed to subscribe');
          }
        } else {
          setError(language === 'ar' ? 'تم رفض الإذن' : 'Permission denied');
        }
      }
    } catch (err) {
      console.error('Toggle error:', err);
      setError(language === 'ar' ? 'حدث خطأ ما' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-border-color rounded-2xl">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSubscribed ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
            {isSubscribed ? <Bell size={20} /> : <BellOff size={20} />}
          </div>
          <div>
            <h3 className="text-sm font-black text-text-main">
              {language === 'ar' ? 'إشعارات المتصفح' : 'Push Notifications'}
            </h3>
            <p className="text-[10px] text-text-muted">
              {language === 'ar' 
                ? 'تلقي تنبيهات عند وصول رسائل جديدة أو تحديثات' 
                : 'Receive alerts for new messages and updates'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            isSubscribed ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`${
              isSubscribed ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </button>
      </div>

      {error && (
        <div className="text-[10px] text-red-500 flex items-center gap-1 px-1">
          <AlertCircle size={10} />
          {error}
        </div>
      )}
      {success && (
        <div className="text-[10px] text-green-500 flex items-center gap-1 px-1">
          <CheckCircle size={10} />
          {success}
        </div>
      )}
    </div>
  );
}
