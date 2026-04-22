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
    }).catch(() => null)

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get compliance overview with safe error handling
    const results = await Promise.allSettled([
      // Licenses expiring in next 30 days - simplified query
      prisma.userLicense.findMany({
        where: {
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date()
          }
        },
        take: 50 // Limit results
      }),
      
      // Pending course completion submissions - simplified
      prisma.courseCompletion.findMany({
        where: {
          status: 'PENDING'
        },
        take: 50,
        orderBy: {
          createdAt: 'asc'
        }
      }),
      
      // Projects without updates in 30 days - simplified
      prisma.project.findMany({
        where: {
          updatedAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          status: {
            in: ['PLANNING', 'IN_PROGRESS']
          }
        },
        take: 50,
        orderBy: {
          updatedAt: 'asc'
        }
      }),
      
      // Users due for review - simplified query
      prisma.user.findMany({
        where: {
          role: { not: 'ADMIN' },
          createdAt: {
            lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          createdAt: true
        },
        take: 50
      })
    ])

    // Extract results safely
    const expiringLicenses = results[0].status === 'fulfilled' ? results[0].value : []
    const pendingCourseSubmissions = results[1].status === 'fulfilled' ? results[1].value : []
    const inactiveProjects = results[2].status === 'fulfilled' ? results[2].value : []
    const overdueReviews = results[3].status === 'fulfilled' ? results[3].value : []

    // Calculate compliance statistics
    const totalUsersResult = await prisma.user.count({
      where: {
        role: { not: 'ADMIN' } // Count non-admin users
      }
    }).catch(() => 0)

    const complianceIssues = {
      expiringLicenses: expiringLicenses.length,
      pendingSubmissions: pendingCourseSubmissions.length,
      inactiveProjects: inactiveProjects.length,
      overdueReviews: overdueReviews.length
    }

    const complianceScore = Math.max(0, 100 - (
      (complianceIssues.expiringLicenses * 10) +
      (complianceIssues.pendingSubmissions * 5) +
      (complianceIssues.inactiveProjects * 3) +
      (complianceIssues.overdueReviews * 8)
    ))

    return NextResponse.json({
      success: true,
      compliance: {
        score: complianceScore,
        totalUsers: totalUsersResult,
        issues: complianceIssues,
        details: {
          expiringLicenses,
          pendingSubmissions: pendingCourseSubmissions,
          inactiveProjects,
          overdueReviews
        }
      }
    })

  } catch (error) {
    console.error('Error fetching compliance data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}