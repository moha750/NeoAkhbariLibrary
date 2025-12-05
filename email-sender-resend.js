// نظام إرسال البريد الإلكتروني باستخدام Resend API
// بديل بسيط لـ Edge Functions

// ضع API Key هنا (احصل عليه من https://resend.com)
const RESEND_API_KEY = 'YOUR_RESEND_API_KEY_HERE';

// دالة إرسال البريد
async function sendInvitationEmailViaResend(email, role, inviteLink, inviterName) {
    const roleText = role === 'admin' ? 'إداري' : 'محرر';
    
    const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0; color: white; font-size: 28px;">
                                <span style="font-size: 40px;">📧</span><br>
                                دعوة للانضمام
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">مرحباً!</h2>
                            
                            <p style="color: #666; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">
                                تم دعوتك من قبل <strong style="color: #667eea;">${inviterName}</strong> للانضمام إلى فريق العمل في لوحة التحكم.
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-right: 4px solid #667eea; margin: 20px 0;">
                                <p style="margin: 0; color: #333; font-size: 16px;">
                                    <strong>الدور المخصص لك:</strong> 
                                    <span style="color: #667eea; font-weight: bold;">${roleText}</span>
                                </p>
                            </div>
                            
                            <p style="color: #666; line-height: 1.8; font-size: 16px; margin: 20px 0;">
                                للقبول والانضمام، اضغط على الزر أدناه:
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${inviteLink}" 
                                           style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                            قبول الدعوة والانضمام
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                أو انسخ الرابط التالي والصقه في المتصفح:<br>
                                <a href="${inviteLink}" style="color: #667eea; word-break: break-all;">${inviteLink}</a>
                            </p>
                            
                            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-right: 4px solid #ffc107; margin: 30px 0 0 0;">
                                <p style="margin: 0; color: #856404; font-size: 14px;">
                                    ⚠️ <strong>ملاحظة:</strong> هذه الدعوة صالحة لمدة 7 أيام فقط.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background: #f8f9fa; border-radius: 0 0 10px 10px; text-align: center;">
                            <p style="margin: 0; color: #999; font-size: 14px;">
                                إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذه الرسالة.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                                © 2024 المكتبة الرقمية - جميع الحقوق محفوظة
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'نظام الدعوات <onboarding@resend.dev>', // غير هذا إلى نطاقك
                to: email,
                subject: 'دعوة للانضمام إلى فريق العمل - المكتبة الرقمية',
                html: emailHtml
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل إرسال البريد');
        }

        const result = await response.json();
        console.log('✅ تم إرسال البريد بنجاح:', result);
        return result;
    } catch (error) {
        console.error('❌ خطأ في إرسال البريد:', error);
        throw error;
    }
}

// استخدام الدالة في supabase-api.js
// استبدل دالة sendInvitationEmail بهذه:
/*
async sendInvitationEmail(email, role, inviteLink, inviterName) {
    return await sendInvitationEmailViaResend(email, role, inviteLink, inviterName);
}
*/
