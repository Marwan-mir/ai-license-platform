'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Award, TrendingUp, CheckCircle } from "lucide-react"
import { CourseCompletion } from "@/components/course/course-completion"

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

interface TrainingDashboardProps {
  user: User
}

export function TrainingDashboard({ user }: TrainingDashboardProps) {
  const userLicenseTypes = user.licenses.filter(l => l.isActive).map(l => l.licenseType)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Dashboard</h1>
          <p className="text-gray-600">Complete courses and track your learning progress</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">12</p>
                <p className="text-xs text-gray-500">For your licenses</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">3</p>
                <p className="text-xs text-gray-500">This quarter</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Training Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">24</p>
                <p className="text-xs text-gray-500">Hours completed</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Compliant
                </Badge>
                <p className="text-xs text-gray-500 mt-1">All required courses</p>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Licenses */}
      <Card>
        <CardHeader>
          <CardTitle>Your AI Licenses</CardTitle>
          <CardDescription>
            Active licenses and their capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {user.licenses.filter(l => l.isActive).map((license, index) => (
              <Badge key={index} variant="outline" className="px-3 py-2">
                {license.licenseType === 'COPILOT_ADVANCED' && 'Copilot Advanced'}
                {license.licenseType === 'COPILOT_STUDIO' && 'Copilot Studio'}
                {license.licenseType === 'POWER_AUTOMATE' && 'Power Automate'}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Completion Component */}
      <CourseCompletion userLicenseTypes={userLicenseTypes} />
    </div>
  )
}