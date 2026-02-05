import { SignJWT, importJWK } from 'jose';

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...uint8Array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendPushNotification(
  subscription: any,
  payload: string | null, // Payload encryption is not implemented for Edge yet
  vapidKeys: { publicKey: string; privateKey: string; subject: string }
) {
  try {
    // 1. Prepare VAPID Token
    const publicKeyBytes = base64UrlToUint8Array(vapidKeys.publicKey);
    const privateKeyBytes = base64UrlToUint8Array(vapidKeys.privateKey);

    // Extract X and Y from public key (uncompressed P-256 point: 0x04 + X + Y)
    // X is bytes 1-32 (index 1 to 33)
    // Y is bytes 33-64 (index 33 to 65)
    // Check if key is compressed or uncompressed
    let x: Uint8Array, y: Uint8Array;
    
    if (publicKeyBytes[0] === 0x04) {
        x = publicKeyBytes.slice(1, 33);
        y = publicKeyBytes.slice(33, 65);
    } else {
        throw new Error('Compressed public keys not supported in this simple implementation');
    }

    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      x: uint8ArrayToBase64Url(x),
      y: uint8ArrayToBase64Url(y),
      d: uint8ArrayToBase64Url(privateKeyBytes),
    };

    const key = await importJWK(jwk, 'ES256');

    const audience = new URL(subscription.endpoint).origin;

    const token = await new SignJWT({
      aud: audience,
      sub: vapidKeys.subject,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    })
      .setProtectedHeader({ alg: 'ES256', typ: 'JWT' })
      .sign(key);

    const authHeader = `vapid t=${token}, k=${vapidKeys.publicKey}`;

    // 2. Send Request
    // Note: We are sending NO payload (body: null) because we cannot encrypt easily in Edge.
    // The Service Worker must fetch the data.
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'TTL': '60',
        // 'Content-Encoding': 'aes128gcm', // Not needed for empty body
      },
      body: null,
    });

    if (!response.ok) {
        // 410 Gone means subscription is invalid
        if (response.status === 410) {
            throw new Error('Subscription expired');
        }
        throw new Error(`Push service error: ${response.status} ${await response.text()}`);
    }

    return true;
  } catch (error: any) {
    if (error.message === 'Subscription expired') {
        throw error;
    }
    console.error('Push send error:', error);
    throw new Error('Failed to send push notification');
  }
}
