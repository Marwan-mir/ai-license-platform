import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Force dynamic rendering to prevent build-time database queries
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// Calculate user achievement score based on various activities
function calculateAchievementScore(user: any): number {
  let score = 0
  
  // Base score for having licenses
  score += user.licenses?.length * 100 || 0
  
  // Project completion bonuses
  const completedProjects = user.ownedProjects?.filter((p: any) => p.status === 'COMPLETED')?.length || 0
  score += completedProjects * 200
  
  // Course completion bonuses  
  const completedCourses = user.courseCompletions?.filter((c: any) => c.status === 'APPROVED')?.length || 0
  score += completedCourses * 50
  
  // Badge bonuses
  score += user.badges?.length * 150 || 0
  
  // Time-based bonuses (early adopter)
  const accountAge = Date.now() - new Date(user.createdAt).getTime()
  const daysOld = accountAge / (1000 * 60 * 60 * 24)
  if (daysOld > 90) score += 100 // Veteran bonus
  
  return Math.round(score)
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'achievements'

    switch (type) {
      case 'achievements':
        return await getAchievements(session.user.id)
      
      case 'leaderboard':
        return await getLeaderboard()
      
      case 'department-stats':
        return await getDepartmentStats()
      
      case 'user-badges':
        return await getUserBadges(session.user.id)
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Gamification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getAchievements(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      licenses: true,
      ownedProjects: true,
      courseCompletions: {
        include: {
          course: true
        }
      },
      badges: {
        include: {
          badge: true
        }
      }
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Define achievement templates
  const achievementTemplates = [
    {
      id: 'first-project',
      name: 'First Steps',
      description: 'Complete your first AI project',
      type: 'PROJECT_COMPLETION',
      target: 1,
      current: user.ownedProjects.filter(p => p.status === 'COMPLETED').length,
      points: 200
    },
    {
      id: 'course-learner',
      name: 'Learning Champion',
      description: 'Complete 5 training courses',
      type: 'COURSE_COMPLIANCE',
      target: 5,
      current: user.courseCompletions.filter(c => c.status === 'APPROVED').length,
      points: 250
    },
    {
      id: 'project-master',
      name: 'Project Master',
      description: 'Complete 10 successful projects',
      type: 'PROJECT_COMPLETION',
      target: 10,
      current: user.ownedProjects.filter(p => p.status === 'COMPLETED').length,
      points: 500
    },
    {
      id: 'course-master',
      name: 'Knowledge Expert',
      description: 'Complete 15 training courses',
      type: 'COURSE_COMPLIANCE',
      target: 15,
      current: user.courseCompletions.filter(c => c.status === 'APPROVED').length,
      points: 750
    },
    {
      id: 'license-collector',
      name: 'License Collector',
      description: 'Hold all 3 license types simultaneously',
      type: 'LICENSE_MASTERY',
      target: 3,
      current: user.licenses.filter(l => l.isActive).length,
      points: 300
    }
  ]

  const achievements = achievementTemplates.map(template => ({
    ...template,
    isUnlocked: template.current >= template.target,
    progress: Math.min((template.current / template.target) * 100, 100),
    unlockedAt: template.current >= template.target ? new Date() : null
  }))

  return NextResponse.json({
    achievements,
    totalScore: calculateAchievementScore(user),
    unlockedCount: achievements.filter(a => a.isUnlocked).length
  })
}

async function getLeaderboard() {
  const users = await prisma.user.findMany({
    where: {
      licenses: {
        some: {
          isActive: true
        }
      }
    },
    include: {
      licenses: { where: { isActive: true } },
      ownedProjects: true,
      courseCompletions: { where: { status: 'APPROVED' } },
      badges: {
        include: { badge: true }
      }
    },
    take: 20
  })

  const leaderboardData = users.map(user => ({
    userId: user.id,
    userName: user.name || user.email,
    department: user.department,
    score: calculateAchievementScore(user),
    achievements: user.badges.length,
    projectsCompleted: user.ownedProjects.filter(p => p.status === 'COMPLETED').length,
    coursesCompleted: user.courseCompletions.length
  }))

  // Sort by score descending and add ranks
  const sortedLeaderboard = leaderboardData
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

  return NextResponse.json({ leaderboard: sortedLeaderboard })
}

async function getDepartmentStats() {
  const departments = ['SME', 'LAKA', 'ONBOARDING', 'SPECIALSERVICE', 'WFM', 'CX']
  
  const departmentStats = await Promise.all(
    departments.map(async (dept) => {
      const users = await prisma.user.findMany({
        where: {
          department: dept as any,
          licenses: {
            some: { isActive: true }
          }
        },
        include: {
          licenses: { where: { isActive: true } },
          ownedProjects: true,
          courseCompletions: { where: { status: 'APPROVED' } },
          badges: { include: { badge: true } }
        }
      })

      const totalScore = users.reduce((sum, user) => sum + calculateAchievementScore(user), 0)
      const avgScore = users.length > 0 ? Math.round(totalScore / users.length) : 0

      return {
        department: dept,
        totalScore,
        avgScore,
        members: users.length,
        totalProjects: users.reduce((sum, user) => sum + user.ownedProjects.filter(p => p.status === 'COMPLETED').length, 0),
        totalCourses: users.reduce((sum, user) => sum + user.courseCompletions.length, 0)
      }
    })
  )

  // Sort by average score and add ranks
  const rankedStats = departmentStats
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((dept, index) => ({
      ...dept,
      rank: index + 1
    }))

  return NextResponse.json({ departments: rankedStats })
}

async function getUserBadges(userId: string) {
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true
    },
    orderBy: {
      awardedAt: 'desc'
    }
  })

  return NextResponse.json({ badges: userBadges })
}

// Award achievement endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { userId, badgeId, reason } = await request.json()

    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
        reason: reason || 'Manually awarded by admin'
      },
      include: {
        badge: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      badge: userBadge 
    })

  } catch (error) {
    console.error('Badge award error:', error)
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500 }
    )
  }
}