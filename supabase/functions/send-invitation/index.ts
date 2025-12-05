// Supabase Edge Function لإرسال دعوات البريد الإلكتروني
// Send Invitation Email via Supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationRequest {
  email: string
  role: string
  inviteLink: string
  inviterName: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // التحقق من الـ Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // إنشاء Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // التحقق من المستخدم
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // قراءة البيانات من الطلب
    const { email, role, inviteLink, inviterName }: InvitationRequest = await req.json()

    // تحديد نص الدور بالعربية
    const roleText = role === 'admin' ? 'إداري' : 'محرر'

    // إنشاء محتوى البريد الإلكتروني بتنسيق HTML
    const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>دعوة للانضمام</title>
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
    `

    // إرسال البريد الإلكتروني باستخدام Supabase Admin API
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // استخدام Supabase Auth لإرسال بريد مخصص
    // ملاحظة: يجب تفعيل SMTP في Supabase Dashboard
    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        invitation_link: inviteLink,
        role: role,
        inviter_name: inviterName,
      },
      redirectTo: inviteLink,
    })

    if (emailError) {
      // إذا فشل إرسال البريد عبر Supabase Auth، نحاول طريقة بديلة
      console.error('Error sending via Supabase Auth:', emailError)
      
      // يمكن استخدام خدمة بريد خارجية هنا كبديل
      // مثل Resend أو SendGrid
      
      throw new Error('Failed to send invitation email')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم إرسال الدعوة بنجاح',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
