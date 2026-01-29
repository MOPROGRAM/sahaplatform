import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'edge';

export async function POST(req: Request) {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
        console.error('RESEND_API_KEY is missing');
        return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    try {
        const body = await req.json();
        const { userId, userName, userEmail, userPhone, message, type } = body;

        // Send email to admin
        const { data, error } = await resend.emails.send({
            from: 'Saha Platform <onboarding@resend.dev>', // Update with your verified domain
            to: 'admin@sahaplatform.com', // Replace with actual admin email
            subject: type === 'corporate' 
                ? `New Corporate Quote Request from ${userName}`
                : `New Manual Points Request from ${userName}`,
            html: `
                <h1>${type === 'corporate' ? 'Corporate Quote Request' : 'Manual Points Purchase Request'}</h1>
                <p><strong>User:</strong> ${userName}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Phone:</strong> ${userPhone}</p>
                <p><strong>User ID:</strong> ${userId || 'N/A'}</p>
                <hr />
                <h3>Message/Details:</h3>
                <p>${message}</p>
            `
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
