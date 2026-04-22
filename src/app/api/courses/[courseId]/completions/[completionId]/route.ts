import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Force dynamic rendering to prevent build-time database queries
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ courseId: string; completionId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { status, adminNotes } = await request.json()
    const { courseId, completionId } = await params

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED or REJECTED' },
        { status: 400 }
      )
    }

    const completion = await prisma.courseCompletion.update({
      where: {
        id: completionId
      },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        course: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: `COURSE_COMPLETION_${status}`,
        entity: 'course_completion',
        entityId: completionId,
        userId: session.user.id,
        details: {
          courseId,
          completionId,
          status,
          adminNotes
        }
      }
    })

    return NextResponse.json({
      success: true,
      completion
    })

  } catch (error) {
    console.error('Error updating course completion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}