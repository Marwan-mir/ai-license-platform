import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const licenseType = searchParams.get('licenseType')

    const whereClause = licenseType ? {
      licenseType: licenseType as any
    } : {}

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            completions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      courses: courses.map(course => ({
        ...course,
        completionCount: course._count.completions
      }))
    })

  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { name, description, licenseType, isMandatory } = await request.json()

    if (!name || !licenseType) {
      return NextResponse.json(
        { error: 'Name and license type are required' },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: {
        name,
        description,
        licenseType,
        isMandatory: isMandatory || false
      }
    })

    return NextResponse.json({
      success: true,
      course
    })

  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}