'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, AlertTriangle, Award, Plus, Settings } from "lucide-react"

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

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  // Mock data for demonstration
  const stats = {
    totalMembers: 0,
    activeProjects: 0,
    monthlyFTE: 0,
    pendingReviews: 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">AI License Management Hub</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Community Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-3xl font-bold">{stats.totalMembers}</p>
                  <p className="text-xs text-gray-500">Active license holders</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-3xl font-bold">{stats.activeProjects}</p>
                  <p className="text-xs text-gray-500">In progress</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly FTE Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-3xl font-bold">{stats.monthlyFTE.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Full-time equivalents</p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-3xl font-bold">{stats.pendingReviews}</p>
                  <p className="text-xs text-gray-500">Require attention</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>
                FTE savings by department this quarter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['SME', 'LAKA', 'Onboarding', 'SpecialService', 'WFM', 'CX'].map((dept) => (
                  <div key={dept} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium">{dept.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{dept}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">0.00</p>
                      <p className="text-xs text-gray-500">FTE</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest platform activities requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">No pending activities</p>
                <p className="text-sm text-gray-400">
                  All submissions and reviews are up to date
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500 mr-4" />
                <div>
                  <h3 className="font-semibold">Manage Members</h3>
                  <p className="text-sm text-gray-600">View and manage community members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Plus className="w-8 h-8 text-green-500 mr-4" />
                <div>
                  <h3 className="font-semibold">Add Course</h3>
                  <p className="text-sm text-gray-600">Create new training courses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-orange-500 mr-4" />
                <div>
                  <h3 className="font-semibold">Review Queue</h3>
                  <p className="text-sm text-gray-600">Pending course submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}