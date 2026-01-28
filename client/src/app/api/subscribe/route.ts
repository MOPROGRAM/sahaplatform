import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!resendApiKey || !supabaseUrl || !supabaseServiceKey) {
        console.error('Missing environment variables for subscription service');
        return NextResponse.json(
            { error: 'Subscription service is currently unavailable' },
            { status: 503 }
        );
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    try {
        const body = await request.json();
        const { userName, userEmail, userPhone, packageName, packagePrice, message, userId } = body;

        // Validate required fields
        if (!userName || !userEmail || !packageName || !packagePrice) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 1. Save to Supabase as backup
        const { data: subscriptionData, error: dbError } = await supabase
            .from('subscription_requests')
            .insert({
                user_id: userId || null,
                user_name: userName,
                user_email: userEmail,
                user_phone: userPhone || null,
                package_name: packageName,
                package_price: packagePrice,
                message: message || '',
                status: 'pending'
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Failed to save subscription request' },
                { status: 500 }
            );
        }

        // 2. Send email via Resend
        const emailContent = `
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .info-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
        .label { font-weight: bold; color: #667eea; }
        .value { margin-top: 5px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 طلب اشتراك جديد - ساحة</h1>
        </div>
        <div class="content">
            <h2>تفاصيل الطلب:</h2>
            
            <div class="info-row">
                <div class="label">📦 الباقة المطلوبة:</div>
                <div class="value">${packageName}</div>
            </div>
            
            <div class="info-row">
                <div class="label">💰 السعر:</div>
                <div class="value">${packagePrice}</div>
            </div>
            
            <div class="info-row">
                <div class="label">👤 اسم العميل:</div>
                <div class="value">${userName}</div>
            </div>
            
            <div class="info-row">
                <div class="label">📧 البريد الإلكتروني:</div>
                <div class="value"><a href="mailto:${userEmail}">${userEmail}</a></div>
            </div>
            
            ${userPhone ? `
            <div class="info-row">
                <div class="label">📱 رقم الهاتف:</div>
                <div class="value"><a href="tel:${userPhone}">${userPhone}</a></div>
            </div>
            ` : ''}
            
            ${message ? `
            <div class="info-row">
                <div class="label">💬 رسالة إضافية:</div>
                <div class="value">${message}</div>
            </div>
            ` : ''}
            
            <div class="info-row">
                <div class="label">🕐 وقت الطلب:</div>
                <div class="value">${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}</div>
            </div>
        </div>
        <div class="footer">
            <p>هذا البريد تم إرساله تلقائياً من منصة ساحة</p>
            <p>يمكنك الرد مباشرة على بريد العميل: ${userEmail}</p>
        </div>
    </div>
</body>
</html>
        `;

        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'ساحة للإعلانات <onboarding@resend.dev>', // Replace with your verified domain
            to: ['motwasel@yahoo.com'],
            replyTo: userEmail,
            subject: `🎯 طلب اشتراك جديد: ${packageName} - ${userName}`,
            html: emailContent,
        });

        if (emailError) {
            console.error('Email error:', emailError);
            // Don't fail the request if email fails, data is already saved
            return NextResponse.json({
                success: true,
                message: 'Subscription request saved, but email notification failed',
                data: subscriptionData
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription request sent successfully',
            data: subscriptionData,
            emailId: emailData?.id
        });

    } catch (error: any) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
