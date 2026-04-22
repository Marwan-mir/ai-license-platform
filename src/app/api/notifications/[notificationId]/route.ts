import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Force dynamic rendering to prevent build-time database queries
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { notificationId } = await params
    const { isRead } = await request.json()

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead }
    })

    return NextResponse.json({
      success: true,
      notification: updatedNotification
    })

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}