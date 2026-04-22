import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
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

    const { courseId } = await params

    const completions = await prisma.courseCompletion.findMany({
      where: {
        courseId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      completions
    })

  } catch (error) {
    console.error('Error fetching course completions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { screenshotUrl, notes } = await request.json()
    const { courseId } = await params

    if (!screenshotUrl) {
      return NextResponse.json(
        { error: 'Screenshot is required' },
        { status: 400 }
      )
    }

    // Check if user already has a completion for this course
    const existingCompletion = await prisma.courseCompletion.findFirst({
      where: {
        courseId,
        userId: session.user.id
      }
    })

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'Course completion already submitted' },
        { status: 400 }
      )
    }

    const completion = await prisma.courseCompletion.create({
      data: {
        courseId,
        userId: session.user.id,
        screenshotUrl,
        notes,
        status: 'PENDING',
        submittedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      completion
    })

  } catch (error) {
    console.error('Error submitting course completion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}