export async function onRequest(context) {
    const { request } = context;

    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    return new Response(JSON.stringify({ status: 'OK', message: 'Saha Platform API is running' }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}