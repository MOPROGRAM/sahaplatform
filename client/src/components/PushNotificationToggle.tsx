"use client";

import { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, CheckCircle, AlertCircle } from 'lucide-react';
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
    // Check if push notifications are supported
    const checkSupport = async () => {
      const supported = await pushNotificationService.initialize();
      setIsSupported(supported);

      if (supported) {
        // Check current permission status
        const currentPermission = Notification.permission;
        setPermission(currentPermission);

        // Check if user is already subscribed
        const subscription = await pushNotificationService.getSubscription();
        setIsSubscribed(!!subscription);
      }
    };

    checkSupport();
  }, []);

  const handlePermissionRequest = async () => {
    if (!user) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Request permission
      const newPermission = await pushNotificationService.requestPermission();
      setPermission(newPermission);

      if (newPermission === 'granted') {
        // Subscribe to push notifications
        const subscription = await pushNotificationService.subscribe();
        
        if (subscription) {
          // Send subscription to server
          const sentToServer = await pushNotificationService.sendSubscriptionToServer(subscription, user.id);
          
          if (sentToServer) {
            setIsSubscribed(true);
            setSuccess('Push notifications enabled successfully');
          } else {
            setError('Failed to save subscription on server');
          }
        } else {
          setError('Failed to subscribe to push notifications');
        }
      } else if (newPermission === 'denied') {
        setError('Push notifications permission denied. Please enable them in your browser settings.');
      }
    } catch (err) {
      console.error('Permission request error:', err);
      setError('An error occurred while requesting permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Unsubscribe from push notifications
      const unsubscribed = await pushNotificationService.unsubscribe();
      
      if (unsubscribed) {
        // Remove subscription from server
        const removedFromServer = await pushNotificationService.removeSubscriptionFromServer(user.id);
        
        if (removedFromServer) {
          setIsSubscribed(false);
          setSuccess('Push notifications disabled successfully');
        } else {
          setError('Failed to remove subscription from server');
        }
      } else {
        setError('Failed to unsubscribe from push notifications');
      }
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setError('An error occurred while unsubscribing');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!isSupported) return <AlertCircle className="w-5 h-5 text-gray-400" />;
    if (permission === 'granted' && isSubscribed) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (permission === 'denied') return <AlertCircle className="w-5 h-5 text-red-500" />;
    return <Bell className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (!isSupported) return 'Not supported';
    if (permission === 'granted' && isSubscribed) return 'Enabled';
    if (permission === 'denied') return 'Blocked';
    if (permission === 'default') return 'Not requested';
    return 'Disabled';
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-between p-4 border border-border-color rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-semibold text-text-main">
              {language === 'ar' ? 'الإشعارات غير مدعومة' : 'Push Notifications Not Supported'}
            </p>
            <p className="text-sm text-text-muted">
              {language === 'ar' ? 'متصفحك لا يدعم الإشعارات الفورية' : 'Your browser does not support push notifications'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border border-border-color rounded-lg">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="font-semibold text-text-main">
              {language === 'ar' ? 'الإشعارات الفورية' : 'Push Notifications'}
            </p>
            <p className="text-sm text-text-muted">
              {getStatusText()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <BellOff className="w-4 h-4" />
              {loading ? '...' : (language === 'ar' ? 'إيقاف' : 'Disable')}
            </button>
          ) : (
            <button
              onClick={handlePermissionRequest}
              disabled={loading || permission === 'denied'}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Bell className="w-4 h-4" />
              {loading ? '...' : (language === 'ar' ? 'تفعيل' : 'Enable')}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
          </div>
        </div>
      )}

      {permission === 'denied' && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {language === 'ar' 
                ? 'تم حظر الإشعارات. يرجى تفعيلها من إعدادات المتصفح.' 
                : 'Notifications are blocked. Please enable them in your browser settings.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}