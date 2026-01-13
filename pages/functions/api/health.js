export async function onRequestGet() {
    return new Response(JSON.stringify({
        status: 'OK',
        timestamp: new Date().toISOString(),
        platform: 'Cloudflare Pages + Functions',
        version: '1.0.0'
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}