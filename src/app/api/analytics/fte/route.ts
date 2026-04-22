import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateFTE } from '@/lib/utils'

// Force dynamic rendering to prevent build-time database queries
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const level = url.searchParams.get('level') // 'organization', 'member', 'project'
    const memberId = url.searchParams.get('memberId')
    const projectId = url.searchParams.get('projectId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    const dateFilter = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) })
    }

    switch (level) {
      case 'organization':
        return await getOrganizationFTE(dateFilter)
      
      case 'member':
        if (!memberId) {
          return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
        }
        return await getMemberFTE(memberId, dateFilter, session.user.role === 'ADMIN')
      
      case 'project':
        if (!projectId) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
        }
        return await getProjectFTE(projectId, dateFilter, session.user.id, session.user.role === 'ADMIN')
      
      default:
        return NextResponse.json({ error: 'Invalid level parameter' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error fetching FTE analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getOrganizationFTE(dateFilter: any) {
  // Get total FTE by department and overall
  const departmentFTE = await prisma.$queryRaw`
    SELECT 
      p.department,
      COUNT(DISTINCT p.id) as project_count,
      SUM(fa.hours_saved) as total_hours_saved,
      SUM(fa.fte_reduction) as total_fte_reduction,
      AVG(fa.fte_reduction) as avg_fte_reduction
    FROM projects p
    LEFT JOIN fte_analytics fa ON p.id = fa.project_id
    WHERE fa.month ${dateFilter.gte ? `>= ${dateFilter.gte}` : 'IS NOT NULL'}
      ${dateFilter.lte ? `AND fa.month <= ${dateFilter.lte}` : ''}
    GROUP BY p.department
    ORDER BY total_fte_reduction DESC
  `

  // Get monthly trends
  const monthlyTrends = await prisma.fteAnalytics.groupBy({
    by: ['month'],
    where: {
      month: dateFilter
    },
    _sum: {
      hoursSaved: true,
      fteReduction: true
    },
    orderBy: {
      month: 'desc'
    },
    take: 12
  })

  // Get top performing projects
  const topProjects = await prisma.project.findMany({
    include: {
      owner: {
        select: {
          name: true,
          email: true,
          department: true
        }
      },
      fteAnalytics: {
        where: {
          month: dateFilter
        },
        orderBy: {
          month: 'desc'
        }
      }
    },
    orderBy: {
      estimatedSavings: 'desc'
    },
    take: 10
  })

  return NextResponse.json({
    departmentFTE,
    monthlyTrends: monthlyTrends.reverse(),
    topProjects,
    summary: {
      totalProjects: await prisma.project.count(),
      totalMembers: await prisma.user.count({ where: { role: 'MEMBER' } }),
      totalFTE: monthlyTrends.reduce((acc, month) => acc + (month._sum.fteReduction || 0), 0)
    }
  })
}

async function getMemberFTE(memberId: string, dateFilter: any, isAdmin: boolean) {
  if (!isAdmin) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const member = await prisma.user.findUnique({
    where: { id: memberId },
    include: {
      licenses: true,
      ownedProjects: {
        include: {
          fteAnalytics: {
            where: {
              month: dateFilter
            },
            orderBy: {
              month: 'desc'
            }
          }
        }
      }
    }
  })

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Calculate member's total FTE contribution
  const totalFTE = member.ownedProjects.reduce((acc, project) => {
    return acc + project.fteAnalytics.reduce((projectAcc, analytics) => {
      return projectAcc + analytics.fteReduction
    }, 0)
  }, 0)

  const totalHours = member.ownedProjects.reduce((acc, project) => {
    return acc + project.fteAnalytics.reduce((projectAcc, analytics) => {
      return projectAcc + analytics.hoursSaved
    }, 0)
  }, 0)

  return NextResponse.json({
    member: {
      id: member.id,
      name: member.name,
      email: member.email,
      department: member.department,
      licenses: member.licenses
    },
    projects: member.ownedProjects,
    summary: {
      totalProjects: member.ownedProjects.length,
      totalFTE,
      totalHours,
      avgFTEPerProject: member.ownedProjects.length > 0 ? totalFTE / member.ownedProjects.length : 0
    }
  })
}

async function getProjectFTE(projectId: string, dateFilter: any, userId: string, isAdmin: boolean) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...(isAdmin ? {} : {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      })
    },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
          department: true
        }
      },
      businessCase: true,
      fteAnalytics: {
        where: {
          month: dateFilter
        },
        orderBy: {
          month: 'desc'
        }
      },
      members: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
  }

  const totalFTE = project.fteAnalytics.reduce((acc, analytics) => acc + analytics.fteReduction, 0)
  const totalHours = project.fteAnalytics.reduce((acc, analytics) => acc + analytics.hoursSaved, 0)

  return NextResponse.json({
    project,
    summary: {
      totalFTE,
      totalHours,
      monthlyAvgFTE: project.fteAnalytics.length > 0 ? totalFTE / project.fteAnalytics.length : 0,
      monthlyAvgHours: project.fteAnalytics.length > 0 ? totalHours / project.fteAnalytics.length : 0
    }
  })
}