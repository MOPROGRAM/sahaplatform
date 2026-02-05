
self.addEventListener('push', function(event) {
  event.waitUntil(
    (async function() {
      // Try to get data from the event if available (not encrypted/encrypted)
      // Since we are not sending payload from Edge API yet, we fetch the latest notification
      
      try {
        // Fetch the latest notification from the server
        // Note: This relies on the browser sending cookies/auth for the API request
        const response = await fetch('/api/notifications/latest');
        if (!response.ok) {
            console.error('Failed to fetch notification details');
            return;
        }

        const data = await response.json();
        
        if (data && data.title) {
            self.registration.showNotification(data.title, {
                body: data.message || data.body || '',
                icon: data.icon || '/icon-192x192.png',
                badge: data.badge || '/icon-72x72.png',
                data: data.data || {},
                tag: 'saha-notification'
            });
        } else {
             // Fallback if no data found
            self.registration.showNotification('Saha Platform', {
                body: 'لديك إشعار جديد',
                icon: '/icon-192x192.png',
                tag: 'saha-generic'
            });
        }
      } catch (error) {
        console.error('Error handling push event:', error);
        // Fallback generic notification
        self.registration.showNotification('Saha Platform', {
            body: 'New notification received',
            icon: '/icon-192x192.png'
        });
      }
    })()
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/notifications');
      }
    })
  );
});
