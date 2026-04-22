import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { parseBusinessCase, processGuidedAnswers } from '@/lib/ai'
import { calculateFTE } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has project licenses
    const hasProjectLicenses = session.user.licenses.some(license => 
      license.isActive && (license.licenseType === 'COPILOT_STUDIO' || license.licenseType === 'POWER_AUTOMATE')
    )

    if (!hasProjectLicenses) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { name, description, businessCase, inputType, department } = await request.json()

    if (!name || !description || !businessCase) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Process business case with AI
    let businessCaseData
    try {
      if (inputType === 'freetext') {
        businessCaseData = await parseBusinessCase(businessCase)
      } else {
        businessCaseData = await processGuidedAnswers(businessCase)
      }
    } catch (aiError) {
      console.error('AI processing failed:', aiError)
      // Fallback to manual parsing if AI fails
      businessCaseData = {
        purpose: description,
        department: department,
        savingsType: 'TIME_EFFICIENCY' as const,
        expectedBenefit: 'Benefits to be determined',
        timeEfficiency: 0
      }
    }

    // Create project and business case in transaction
    const project = await prisma.$transaction(async (tx) => {
      // Create the project
      const newProject = await tx.project.create({
        data: {
          name,
          description,
          ownerId: session.user.id,
          department: businessCaseData.department as any || department || session.user.department,
          savingsType: businessCaseData.savingsType,
          estimatedSavings: businessCaseData.timeEfficiency || 0,
        },
      })

      // Create the business case
      await tx.businessCase.create({
        data: {
          projectId: newProject.id,
          purpose: businessCaseData.purpose,
          department: businessCaseData.department as any || department,
          savingsType: businessCaseData.savingsType,
          expectedBenefit: businessCaseData.expectedBenefit,
          timeEfficiency: businessCaseData.timeEfficiency,
          qualityImpact: businessCaseData.qualityImpact,
          aiGenerated: true,
          rawInput: JSON.stringify(businessCase),
          createdBy: session.user.id,
        },
      })

      // Add owner as project member
      await tx.projectMember.create({
        data: {
          projectId: newProject.id,
          userId: session.user.id,
          role: 'owner',
        },
      })

      // Create initial FTE analytics if time efficiency is specified
      if (businessCaseData.timeEfficiency && businessCaseData.timeEfficiency > 0) {
        const currentMonth = new Date()
        currentMonth.setDate(1) // First day of current month
        
        await tx.fteAnalytics.create({
          data: {
            projectId: newProject.id,
            month: currentMonth,
            hoursSaved: businessCaseData.timeEfficiency,
            fteReduction: calculateFTE(businessCaseData.timeEfficiency),
          },
        })
      }

      // Log audit trail
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_PROJECT',
          entity: 'project',
          entityId: newProject.id,
          details: {
            projectName: name,
            inputType,
            aiGenerated: true,
          },
        },
      })

      return newProject
    })

    return NextResponse.json({ 
      success: true, 
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
      }
    })

  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get projects where user is owner or member
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        businessCase: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        fteAnalytics: {
          orderBy: {
            month: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take: limit,
    })

    const totalCount = await prisma.project.count({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      }
    })

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}