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

    // Get compliance overview
    const [expiringLicenses, pendingCourseSubmissions, inactiveProjects, overdueReviews] = await Promise.all([
      // Licenses expiring in next 30 days
      prisma.userLicense.findMany({
        where: {
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date()
          }
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
        }
      }),
      
      // Pending course completion submissions
      prisma.courseCompletion.findMany({
        where: {
          status: 'PENDING'
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
              name: true,
              isMandatory: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      
      // Projects without updates in 30 days
      prisma.project.findMany({
        where: {
          updatedAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          status: {
            in: ['PLANNING', 'IN_PROGRESS']
          }
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true
            }
          }
        },
        orderBy: {
          updatedAt: 'asc'
        }
      }),
      
      // Users due for bi-annual review (6+ months since last review)
      prisma.user.findMany({
        where: {
          licenses: {
            some: {}
          },
          // This would need a lastReviewDate field in the schema
          // For now, we'll use createdAt as a placeholder
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
        }
      })
    ])

    // Calculate compliance statistics
    const totalUsers = await prisma.user.count({
      where: {
        licenses: {
          some: {}
        }
      }
    })

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
        totalUsers,
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