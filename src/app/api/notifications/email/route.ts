import nodemailer from 'nodemailer'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

interface EmailNotificationPayload {
  type: 'license_expiry' | 'course_reminder' | 'project_inactive' | 'review_overdue' | 'custom'
  recipients: string[]
  subject: string
  message: string
  isUrgent?: boolean
  data?: any
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload: EmailNotificationPayload = await request.json()
    
    // Validate required fields
    if (!payload.recipients.length || !payload.subject || !payload.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send emails to recipients
    const emailPromises = payload.recipients.map(async (email) => {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'noreply@aiplatform.com',
          to: email,
          subject: payload.isUrgent ? `[URGENT] ${payload.subject}` : payload.subject,
          html: generateEmailTemplate(payload),
        })

        // Log the email notification in database
        await prisma.notification.create({
          data: {
            title: payload.subject,
            message: payload.message,
            type: payload.type,
            isUrgent: payload.isUrgent || false,
            user: {
              connect: {
                email: email
              }
            }
          }
        })

        return { email, status: 'sent' }
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error)
        return { 
          email, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    const results = await Promise.all(emailPromises)
    
    return NextResponse.json({
      success: true,
      results,
      totalSent: results.filter(r => r.status === 'sent').length,
      totalFailed: results.filter(r => r.status === 'failed').length
    })

  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send email notifications' },
      { status: 500 }
    )
  }
}

// Get automated notification preferences
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Return email notification settings and statistics
    const settings = {
      licenseReminderDays: [30, 14, 7, 1], // Days before expiry to send reminders
      courseReminderDays: [7, 3, 1], // Days before course deadline
      projectInactivityDays: 30, // Days of inactivity before notification
      reviewOverdueDays: 0, // Send immediately when overdue
      emailEnabled: true,
    }

    return NextResponse.json({ settings })

  } catch (error) {
    console.error('Error fetching email settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email settings' },
      { status: 500 }
    )
  }
}

function generateEmailTemplate(payload: EmailNotificationPayload): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${payload.subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${payload.isUrgent ? '#ef4444' : '#3b82f6'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; }
            .footer { background: #e5e7eb; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
            .urgent { border-left: 4px solid #ef4444; padding-left: 16px; background: #fef2f2; margin: 16px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${payload.isUrgent ? '🚨 URGENT: ' : ''}${payload.subject}</h1>
            </div>
            <div class="content">
                ${payload.isUrgent ? '<div class="urgent"><strong>This message requires immediate attention.</strong></div>' : ''}
                <div>${payload.message.replace(/\n/g, '<br>')}</div>
                ${generateTypeSpecificContent(payload)}
            </div>
            <div class="footer">
                <p>This is an automated message from the AI License Management Platform.</p>
                <p>If you have questions, please contact your administrator.</p>
            </div>
        </div>
    </body>
    </html>
  `
  return baseTemplate
}

function generateTypeSpecificContent(payload: EmailNotificationPayload): string {
  switch (payload.type) {
    case 'license_expiry':
      return `
        <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 6px;">
          <strong>Action Required:</strong> Please contact your administrator to renew your license before it expires.
        </div>
      `
    case 'course_reminder':
      return `
        <div style="margin: 20px 0; padding: 15px; background: #d1ecf1; border-radius: 6px;">
          <strong>Course Completion Reminder:</strong> Complete your assigned courses to maintain compliance.
        </div>
      `
    case 'project_inactive':
      return `
        <div style="margin: 20px 0; padding: 15px; background: #f8d7da; border-radius: 6px;">
          <strong>Project Update Needed:</strong> Your project requires updates to remain active.
        </div>
      `
    case 'review_overdue':
      return `
        <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 6px;">
          <strong>Bi-Annual Review Overdue:</strong> Please schedule your license review session.
        </div>
      `
    default:
      return ''
  }
}