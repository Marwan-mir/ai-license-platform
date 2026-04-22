'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, TrendingUp, AlertTriangle, Calendar, BarChart3, BookOpen } from "lucide-react"
import { FTEAnalytics } from "@/components/analytics/fte-analytics"
import { CourseManagement } from "@/components/course/course-management"
import { NotificationManagement } from "@/components/admin/notification-management"
import { AchievementSystem } from "@/components/gamification/achievement-system"

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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage community members, projects, and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button>Export Report</Button>
          <Button variant="outline">Generate Audit</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">FTE Analytics</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">247</p>
                    <p className="text-xs text-gray-500">+12 this month</p>
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">89</p>
                    <p className="text-xs text-gray-500">23 completed this month</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">License Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">94%</p>
                    <p className="text-xs text-gray-500">15 pending renewals</p>
                  </div>
                  <Badge variant="secondary">Good</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total FTE Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">47.3</p>
                    <p className="text-xs text-gray-500">+8.2 this quarter</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>
                License usage and project activity by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'SME (Subject Matter Experts)', members: 45, projects: 28, fte: 12.3, licenses: ['Copilot Advanced', 'Power Automate'] },
                  { name: 'LAKA (Legal & Compliance)', members: 23, projects: 15, fte: 8.7, licenses: ['Copilot Advanced'] },
                  { name: 'Onboarding', members: 38, projects: 22, fte: 9.8, licenses: ['Copilot Advanced', 'Copilot Studio'] },
                  { name: 'Special Service', members: 19, projects: 12, fte: 6.2, licenses: ['Power Automate'] },
                  { name: 'WFM (Workforce Management)', members: 31, projects: 18, fte: 7.1, licenses: ['Copilot Advanced', 'Power Automate'] },
                  { name: 'CX (Customer Experience)', members: 28, projects: 16, fte: 5.9, licenses: ['Copilot Studio'] }
                ].map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium">{dept.name}</p>
                      <div className="flex gap-2 mt-1">
                        {dept.licenses.map((license, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {license}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-center">
                      <div>
                        <p className="text-lg font-semibold">{dept.members}</p>
                        <p className="text-xs text-gray-500">Members</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{dept.projects}</p>
                        <p className="text-xs text-gray-500">Projects</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{dept.fte}</p>
                        <p className="text-xs text-gray-500">FTE Saved</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest community actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'New project created', user: 'Sarah Chen', time: '2 minutes ago', type: 'project' },
                    { action: 'Course completed', user: 'Marcus Johnson', time: '15 minutes ago', type: 'course' },
                    { action: 'Business case approved', user: 'Emma Wilson', time: '1 hour ago', type: 'approval' },
                    { action: 'License renewed', user: 'David Park', time: '2 hours ago', type: 'license' },
                    { action: 'Project milestone reached', user: 'Lisa Rodriguez', time: '3 hours ago', type: 'project' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-2">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'project' ? 'bg-blue-500' :
                        activity.type === 'course' ? 'bg-green-500' :
                        activity.type === 'approval' ? 'bg-purple-500' : 'bg-orange-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">by {activity.user}</p>
                      </div>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Compliance Alerts
                </CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { message: '15 licenses expiring in 30 days', severity: 'medium', count: 15 },
                    { message: '3 courses pending approval', severity: 'high', count: 3 },
                    { message: '8 projects without recent updates', severity: 'low', count: 8 },
                    { message: 'Bi-annual review due for 22 members', severity: 'medium', count: 22 }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {alert.count}
                        </Badge>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <FTEAnalytics isAdmin={true} />
        </TabsContent>

        <TabsContent value="courses">
          <CourseManagement />
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Members</CardTitle>
              <CardDescription>Manage license holders and their activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Member management interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Compliance Dashboard
              </CardTitle>
              <CardDescription>Monitor compliance requirements and audit trails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Compliance monitoring interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationManagement />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <AchievementSystem />
        </TabsContent>
      </Tabs>
    </div>
  )
}