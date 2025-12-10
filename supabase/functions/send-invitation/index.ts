// Edge Function لإرسال دعوات البريد الإلكتروني
// Send Invitation Email Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // إنشاء عميل Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // الحصول على معرف الدعوة والرابط من الطلب
    const { invitationId, siteUrl } = await req.json()

    if (!invitationId) {
      throw new Error('معرف الدعوة مطلوب')
    }

    // جلب بيانات الدعوة
    const { data: invitation, error: invError } = await supabaseClient
      .from('invitations')
      .select(`
        *,
        user_roles (
          display_name
        ),
        invited_by_user:users!invitations_invited_by_fkey (
          email,
          full_name
        )
      `)
      .eq('id', invitationId)
      .single()

    if (invError) throw invError
    if (!invitation) throw new Error('الدعوة غير موجودة')

    // إنشاء رابط الدعوة
    // استخدام siteUrl من الطلب، أو SITE_URL من البيئة، أو localhost كآخر خيار
    const baseUrl = siteUrl || Deno.env.get('SITE_URL') || 'http://localhost:5500'
    const invitationLink = `${baseUrl}/signup.html?token=${invitation.token}`
    
    console.log('📧 إرسال دعوة إلى:', invitation.email)
    console.log('🌐 Base URL:', baseUrl)
    console.log('🔗 رابط الدعوة:', invitationLink)

    // إرسال بريد إلكتروني مخصص (بدون إنشاء مستخدم)
    // ملاحظة: inviteUserByEmail ينشئ المستخدم تلقائياً، لذلك نستخدم طريقة أخرى
    
    // استخدام Supabase Admin لإرسال بريد مخصص
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // إنشاء محتوى البريد
    const emailSubject = 'دعوة للانضمام إلى المكتبة الرقمية'
    const emailBody = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>مرحباً!</h2>
        <p>تمت دعوتك للانضمام إلى فريق المكتبة الرقمية بصفة <strong>${invitation.user_roles?.display_name || 'عضو'}</strong>.</p>
        ${invitation.invited_by_user ? `<p><strong>دعوة من:</strong> ${invitation.invited_by_user.full_name || invitation.invited_by_user.email}</p>` : ''}
        <p><strong>البريد الإلكتروني:</strong> ${invitation.email}</p>
        <p>للانضمام، يرجى النقر على الرابط أدناه لإنشاء حسابك:</p>
        <p><a href="${invitationLink}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">إنشاء الحساب</a></p>
        <p style="color: #666; font-size: 14px;">أو انسخ الرابط التالي: ${invitationLink}</p>
        <p style="color: #999; font-size: 12px;">هذه الدعوة صالحة حتى ${new Date(invitation.expires_at).toLocaleDateString('ar-EG')}</p>
      </div>
    `

    // محاولة إرسال البريد عبر Supabase (يتطلب SMTP مُعد)
    let emailSent = false
    
    try {
      // استخدام Database Function لإرسال البريد
      const { error: emailError } = await supabaseAdmin.rpc('send_email', {
        recipient: invitation.email,
        subject: emailSubject,
        body: emailBody
      })

      if (emailError) {
        console.warn('⚠️ لا يمكن إرسال البريد عبر Database Function:', emailError.message)
        emailSent = false
      } else {
        console.log('✅ تم إرسال البريد بنجاح')
        emailSent = true
      }
    } catch (error) {
      console.warn('⚠️ Database Function غير متوفرة')
      emailSent = false
    }

    // إذا لم يُرسل البريد، إرجاع success: false
    if (!emailSent) {
      console.warn('⚠️ لم يتم إرسال البريد - استخدم الرابط اليدوي')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'إرسال البريد غير متاح حالياً. يمكنك نسخ الرابط وإرساله يدوياً.',
          invitationLink
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,  // 200 لأن الدعوة تم إنشاؤها بنجاح
        }
      )
    }

    // البريد تم إرساله بنجاح
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إرسال الدعوة بنجاح',
        invitationLink
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('خطأ:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
