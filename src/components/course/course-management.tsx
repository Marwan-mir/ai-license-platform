'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, BookOpen, CheckCircle, XCircle, Clock, Users } from "lucide-react"
import { getLicenseTypeDisplayName, getDepartmentDisplayName } from "@/lib/utils"

interface Course {
  id: string
  name: string
  description?: string
  licenseType?: 'COPILOT_ADVANCED' | 'COPILOT_STUDIO' | 'POWER_AUTOMATE'
  isMandatory: boolean
  createdAt: Date
  completionCount: number
}

interface CourseCompletion {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  screenshotUrl: string
  notes?: string
  adminNotes?: string
  submittedAt: Date
  reviewedAt?: Date
  user: {
    id: string
    name?: string
    email: string
    department?: string
  }
}

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [completions, setCompletions] = useState<CourseCompletion[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    licenseType: '',
    isMandatory: false
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchCompletions(selectedCourse)
    }
  }, [selectedCourse])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const result = await response.json()
        setCourses(result.courses || [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchCompletions = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/completions`)
      if (response.ok) {
        const result = await response.json()
        setCompletions(result.completions || [])
      }
    } catch (error) {
      console.error('Error fetching completions:', error)
    }
  }

  const handleCreateCourse = async () => {
    if (!newCourse.name || !newCourse.licenseType) return

    setLoading(true)
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCourse)
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setNewCourse({
          name: '',
          description: '',
          licenseType: '',
          isMandatory: false
        })
        fetchCourses()
      }
    } catch (error) {
      console.error('Error creating course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewCompletion = async (completionId: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string) => {
    try {
      const response = await fetch(`/api/courses/${selectedCourse}/completions/${completionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminNotes })
      })

      if (response.ok) {
        fetchCompletions(selectedCourse)
      }
    } catch (error) {
      console.error('Error reviewing completion:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-gray-600">Create and manage training courses for license holders</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>Add a new training course for community members</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <Label htmlFor="licenseType">Target License Type</Label>
                <Select value={newCourse.licenseType} onValueChange={(value) => setNewCourse(prev => ({ ...prev, licenseType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select license type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COPILOT_ADVANCED">Copilot Advanced</SelectItem>
                    <SelectItem value="COPILOT_STUDIO">Copilot Studio</SelectItem>
                    <SelectItem value="POWER_AUTOMATE">Power Automate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Course description"
                  rows={3}
                />
              </div>



              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiredForCompliance"
                  checked={newCourse.isMandatory}
                  onCheckedChange={(checked) => setNewCourse(prev => ({ ...prev, isMandatory: checked as boolean }))}
                />
                <Label htmlFor="requiredForCompliance">Required for Compliance</Label>
              </div>
              <Button onClick={handleCreateCourse} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">All Courses</TabsTrigger>
          <TabsTrigger value="submissions">Course Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <Badge variant="outline">
                      {course.licenseType ? getLicenseTypeDisplayName(course.licenseType) : 'All Licenses'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Completions: 0</span>
                      </div>
                      {course.isMandatory && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Selection</CardTitle>
                <CardDescription>Select a course to review submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a course to review submissions" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.completionCount} submissions)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedCourse && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Submissions</CardTitle>
                  <CardDescription>Review and approve course completion submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  {completions.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No submissions for this course</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {completions.map((completion) => (
                        <div key={completion.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">{completion.user.name || completion.user.email}</p>
                              <p className="text-sm text-gray-500">
                                {getDepartmentDisplayName(completion.user.department || '')} • 
                                Submitted {new Date(completion.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                            {getStatusBadge(completion.status)}
                          </div>
                          
                          {completion.notes && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700">Student Notes:</p>
                              <p className="text-sm text-gray-600">{completion.notes}</p>
                            </div>
                          )}
                          
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700">Screenshot:</p>
                            <img 
                              src={completion.screenshotUrl} 
                              alt="Course completion screenshot"
                              className="mt-2 max-w-md rounded border"
                            />
                          </div>

                          {completion.adminNotes && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                              <p className="text-sm text-gray-600">{completion.adminNotes}</p>
                            </div>
                          )}

                          {completion.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleReviewCompletion(completion.id, 'APPROVED')}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleReviewCompletion(completion.id, 'REJECTED', 'Please resubmit with a clearer screenshot')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}