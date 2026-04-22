import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AutomatedNotificationService {
  checkLicenseExpirations(): Promise<void>
  checkCourseDeadlines(): Promise<void>
  checkProjectInactivity(): Promise<void>
  checkBiAnnualReviews(): Promise<void>
  sendScheduledNotifications(): Promise<void>
}

class NotificationService implements AutomatedNotificationService {
  private readonly EMAIL_API_URL = '/api/notifications/email'
  
  async checkLicenseExpirations(): Promise<void> {
    console.log('Checking for expiring licenses...')
    
    const reminderDays = [30, 14, 7, 1] // Days before expiry to send reminders
    
    for (const days of reminderDays) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + days)
      
      // Find licenses expiring in exactly 'days' days
      const expiringLicenses = await prisma.userLicense.findMany({
        where: {
          expiryDate: {
            gte: new Date(expiryDate.toDateString()),
            lt: new Date(new Date(expiryDate.getTime() + 24 * 60 * 60 * 1000).toDateString())
          },
          isActive: true
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
              department: true
            }
          }
        }
      })

      if (expiringLicenses.length > 0) {
        console.log(`Found ${expiringLicenses.length} licenses expiring in ${days} days`)
        
        // Group by license type for better messaging
        const groupedLicenses = expiringLicenses.reduce((acc: Record<string, typeof expiringLicenses>, license) => {
          if (!acc[license.licenseType]) acc[license.licenseType] = []
          acc[license.licenseType].push(license)
          return acc
        }, {})

        // Send notifications for each license type
        for (const [licenseType, licenses] of Object.entries(groupedLicenses)) {
          const recipients = licenses.map(l => l.user.email).filter(Boolean) as string[]
          
          const subject = `License Renewal Required: ${this.formatLicenseType(licenseType)} (${days} days remaining)`
          const message = this.generateLicenseExpiryMessage(licenseType, days, licenses)
          
          await this.sendEmailNotification({
            type: 'license_expiry',
            recipients,
            subject,
            message,
            isUrgent: days <= 7,
            data: { licenseType, days, count: licenses.length }
          })
        }
      }
    }
  }

  async checkCourseDeadlines(): Promise<void> {
    console.log('Checking for course deadlines...')
    
    // For now, we'll simplify this to just find pending course completions
    // In a full implementation, we'd add deadline functionality to courses
    
    const pendingSubmissions = await prisma.courseCompletion.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            department: true
          }
        },
        course: {
          select: {
            name: true,
            description: true,
            isMandatory: true
          }
        }
      }
    })

    if (pendingSubmissions.length > 0) {
      console.log(`Found ${pendingSubmissions.length} pending course submissions`)
      
      // Send reminders for mandatory courses that are pending
      for (const submission of pendingSubmissions) {
        if (submission.course.isMandatory) {
          const subject = `Required Course Completion: ${submission.course.name}`
          const message = this.generateCourseReminderMessage(submission.course, 0)
          
          await this.sendEmailNotification({
            type: 'course_reminder',
            recipients: [submission.user.email!],
            subject,
            message,
            isUrgent: true,
            data: { courseId: submission.courseId, mandatory: true }
          })
        }
      }
    }
  }

  async checkProjectInactivity(): Promise<void> {
    console.log('Checking for inactive projects...')
    
    const inactivityThreshold = new Date()
    inactivityThreshold.setDate(inactivityThreshold.getDate() - 30) // 30 days of inactivity
    
    const inactiveProjects = await prisma.project.findMany({
      where: {
        status: 'IN_PROGRESS',
        updatedAt: {
          lt: inactivityThreshold
        }
      },
      include: {
        owner: {
          select: {
            email: true,
            name: true,
            department: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (inactiveProjects.length > 0) {
      console.log(`Found ${inactiveProjects.length} inactive projects`)
      
      for (const project of inactiveProjects) {
        // Notify project owner and members
        const recipients = [
          project.owner.email!,
          ...project.members.map(m => m.user.email!).filter(Boolean)
        ].filter((email, index, self) => self.indexOf(email) === index) // Remove duplicates
        
        const subject = `Project Update Required: ${project.name}`
        const message = this.generateProjectInactivityMessage(project)
        
        await this.sendEmailNotification({
          type: 'project_inactive',
          recipients,
          subject,
          message,
          isUrgent: false,
          data: { projectId: project.id, daysSinceUpdate: Math.floor((Date.now() - project.updatedAt.getTime()) / (24 * 60 * 60 * 1000)) }
        })
      }
    }
  }

  async checkBiAnnualReviews(): Promise<void> {
    console.log('Checking for overdue bi-annual reviews...')
    
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    // Find users with active licenses (simplified version)
    const usersWithLicenses = await prisma.user.findMany({
      where: {
        licenses: {
          some: {
            isActive: true
          }
        }
      },
      include: {
        licenses: {
          where: { isActive: true }
        }
      }
    })

    if (usersWithLicenses.length > 0) {
      console.log(`Found ${usersWithLicenses.length} users who may need reviews`)
      
      for (const user of usersWithLicenses) {
        const subject = 'Bi-Annual License Review Required'
        const message = this.generateReviewOverdueMessage(user)
        
        await this.sendEmailNotification({
          type: 'review_overdue',
          recipients: [user.email!],
          subject,
          message,
          isUrgent: true,
          data: { 
            userId: user.id, 
            activeLicenses: user.licenses.length 
          }
        })
      }
    }
  }

  async sendScheduledNotifications(): Promise<void> {
    console.log('Running automated notification checks...')
    
    try {
      await Promise.all([
        this.checkLicenseExpirations(),
        this.checkCourseDeadlines(),
        this.checkProjectInactivity(),
        this.checkBiAnnualReviews()
      ])
      
      console.log('Automated notification checks completed successfully')
    } catch (error) {
      console.error('Error during automated notification checks:', error)
      throw error
    }
  }

  private async sendEmailNotification(payload: any): Promise<void> {
    try {
      // In a real implementation, this would make an authenticated request
      // to the email API endpoint. For now, we'll log the notification.
      console.log('Would send email notification:', {
        type: payload.type,
        recipients: payload.recipients.length,
        subject: payload.subject,
        isUrgent: payload.isUrgent
      })
      
      // Store notification in database for audit trail
      for (const email of payload.recipients) {
        await prisma.notification.create({
          data: {
            title: payload.subject,
            message: payload.message,
            type: payload.type,
            isUrgent: payload.isUrgent || false,
            user: {
              connect: { email }
            }
          }
        }).catch(error => {
          console.error(`Failed to store notification for ${email}:`, error)
        })
      }
    } catch (error) {
      console.error('Failed to send email notification:', error)
    }
  }

  private formatLicenseType(licenseType: string): string {
    switch (licenseType) {
      case 'COPILOT_ADVANCED':
        return 'GitHub Copilot Advanced'
      case 'COPILOT_STUDIO':
        return 'Copilot Studio'
      case 'POWER_AUTOMATE':
        return 'Power Automate'
      default:
        return licenseType
    }
  }

  private generateLicenseExpiryMessage(licenseType: string, days: number, licenses: any[]): string {
    const formattedType = this.formatLicenseType(licenseType)
    const urgencyText = days <= 7 ? '⚠️ URGENT: ' : ''
    
    return `${urgencyText}Your ${formattedType} license will expire in ${days} day${days === 1 ? '' : 's'}.

Please contact your administrator immediately to renew your license and avoid service interruption.

License Details:
- Type: ${formattedType}
- Expiry Date: ${licenses[0]?.expiryDate ? new Date(licenses[0].expiryDate).toLocaleDateString() : 'Unknown'}
- Users Affected: ${licenses.length}

Action Required: Schedule license renewal before expiration date.`
  }

  private generateCourseReminderMessage(course: any, days: number): string {
    const urgencyText = days <= 1 ? '🚨 URGENT: ' : course.isMandatory ? '⚠️ REQUIRED: ' : ''
    
    return `${urgencyText}Course completion reminder for "${course.name}"

${course.description || 'Please complete this course to maintain your license compliance.'}

Deadline: ${course.deadline ? new Date(course.deadline).toLocaleDateString() : 'Unknown'}
Time Remaining: ${days} day${days === 1 ? '' : 's'}
${course.isMandatory ? 'This is a mandatory course for license holders.' : ''}

Please complete your course submission as soon as possible.`
  }

  private generateProjectInactivityMessage(project: any): string {
    const daysSinceUpdate = Math.floor((Date.now() - project.updatedAt.getTime()) / (24 * 60 * 60 * 1000))
    
    return `Project "${project.name}" has been inactive for ${daysSinceUpdate} days.

Your project requires regular updates to remain active in our system. Inactive projects may affect your license utilization metrics.

Project Details:
- Name: ${project.name}
- Status: ${project.status}
- Last Updated: ${project.updatedAt.toLocaleDateString()}
- Days Inactive: ${daysSinceUpdate}

Please log in to update your project status or provide a progress report.`
  }

  private generateReviewOverdueMessage(user: any): string {
    return `🔴 Your bi-annual license review is due.

All license holders are required to complete a review session every 6 months to ensure compliance and optimal license utilization.

Review Status:
- User: ${user.name || user.email}
- Active Licenses: ${user.licenses.length}
- Department: ${user.department || 'Not specified'}

Please contact your administrator to schedule your review session. Regular reviews help maintain compliance and optimize license usage.`
  }
}

export const notificationService = new NotificationService()

// Export for cron jobs or scheduled tasks
export { NotificationService }
export default notificationService