'use client'

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Clock, TrendingUp, Award } from "lucide-react"
import { getLicenseTypeDisplayName, getDepartmentDisplayName } from "@/lib/utils"

interface User {
  id: string
  name?: string | null
  email?: string | null
  role: 'MEMBER' | 'ADMIN'
  department?: 'SME' | 'LAKA' | 'ONBOARDING' | 'SPECIALSERVICE' | 'WFM' | 'CX'
  licenses: Array<{
    licenseType: 'COPILOT_ADVANCED' | 'COPILOT_STUDIO' | 'POWER_AUTOMATE'
    isActive: boolean
  }>
}

interface ProjectDashboardProps {
  user: User
}

export function ProjectDashboard({ user }: ProjectDashboardProps) {
  const projectLicenses = user.licenses.filter(license => 
    license.isActive && (license.licenseType === 'COPILOT_STUDIO' || license.licenseType === 'POWER_AUTOMATE')
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name || user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user.department && getDepartmentDisplayName(user.department)}
              </span>
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* License Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Active Licenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {projectLicenses.map((license, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{getLicenseTypeDisplayName(license.licenseType)}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-3xl font-bold">0</p>
                  <p className="text-xs text-gray-500">No projects yet</p>
                </div>
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Time Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-3xl font-bold">0h</p>
                  <p className="text-xs text-gray-500">Monthly savings</p>
                </div>
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Your latest project activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">No projects created yet</p>
                <Button variant="outline">Create Your First Project</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Progress</CardTitle>
              <CardDescription>
                Mandatory course completion status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed Courses</span>
                  <span className="font-medium">0 / 0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-gray-500">Complete mandatory training to unlock all features</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}