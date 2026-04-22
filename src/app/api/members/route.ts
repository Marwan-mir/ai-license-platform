import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Force dynamic rendering to prevent build-time database queries
export const dynamic = 'force-dynamic'

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

    // Get all community members (users with licenses)
    const members = await prisma.user.findMany({
      where: {
        licenses: {
          some: {}
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        department: true,
        role: true,
        createdAt: true,
        licenses: {
          select: {
            licenseType: true,
            issuedDate: true,
            expiryDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get project counts separately
    const memberProjectCounts = await prisma.projectMember.groupBy({
      by: ['userId'],
      _count: {
        userId: true
      }
    })

    const projectCountMap = memberProjectCounts.reduce((acc, item) => {
      acc[item.userId] = item._count.userId
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      members: members.map((member: any) => ({
        ...member,
        projectCount: projectCountMap[member.id] || 0
      }))
    })

  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}