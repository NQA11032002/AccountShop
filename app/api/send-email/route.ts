import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, content, credentials, orderInfo } = body;

    console.log('📧 Email sending request received:', { 
      to, 
      subject: subject?.substring(0, 50) + '...',
      hasContent: !!content,
      hasCredentials: !!credentials 
    });

    // Validate required fields
    if (!to || !subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, content' },
        { status: 400 }
      );
    }

    // For now, we'll simulate email sending with a realistic delay
    // In production, you would integrate with a real email service like:
    // - Nodemailer with SMTP
    // - SendGrid API
    // - AWS SES
    // - Mailgun
    // - Resend
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Simulate occasional failures (5% chance) for realistic testing
    if (Math.random() < 0.05) {
      throw new Error('Email service temporarily unavailable');
    }

    // Log the email details for debugging
    console.log('✅ Email sent successfully:', {
      to,
      subject,
      timestamp: new Date().toISOString(),
      orderInfo: orderInfo?.orderId,
      credentialsProvided: !!credentials
    });

    // 🔧 PRODUCTION EMAIL INTEGRATION GUIDE:
    // Replace the simulation above with one of these real email services:
    
    /* 
    // 📧 Option 1: Nodemailer with SMTP
    import nodemailer from 'nodemailer';
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or your SMTP service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@qaistore.com',
      to: to,
      subject: subject,
      html: content
    });
    */

    /*
    // 📧 Option 2: SendGrid
    import sgMail from '@sendgrid/mail';
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    
    await sgMail.send({
      to: to,
      from: process.env.EMAIL_FROM || 'noreply@qaistore.com',
      subject: subject,
      html: content
    });
    */

    /*
    // 📧 Option 3: Resend (Modern choice)
    import { Resend } from 'resend';
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@qaistore.com',
      to: to,
      subject: subject,
      html: content
    });
    */

    // Store email log for tracking (optional)
    const emailLog = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to,
      subject,
      sentAt: new Date().toISOString(),
      status: 'sent',
      orderId: orderInfo?.orderId,
      customerName: orderInfo?.customerName
    };

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: emailLog.id,
      timestamp: emailLog.sentAt
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Email API endpoint is active',
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
}