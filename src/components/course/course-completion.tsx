'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, ExternalLink, Upload, CheckCircle, Clock, XCircle } from "lucide-react"
import { getLicenseTypeDisplayName } from "@/lib/utils"

interface Course {
  id: string
  title: string
  description?: string
  targetLicenseType: 'COPILOT_ADVANCED' | 'COPILOT_STUDIO' | 'POWER_AUTOMATE'
  provider?: string
  url?: string
  estimatedHours: number
  requiredForCompliance: boolean
}

interface UserCompletion {
  id: string
  courseId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  screenshotUrl: string
  notes?: string
  adminNotes?: string
  submittedAt: Date
  reviewedAt?: Date
}

interface CourseCompletionProps {
  userLicenseTypes: string[]
}

export function CourseCompletion({ userLicenseTypes }: CourseCompletionProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [userCompletions, setUserCompletions] = useState<UserCompletion[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submission, setSubmission] = useState({
    screenshotUrl: '',
    notes: ''
  })

  useEffect(() => {
    fetchCourses()
    fetchUserCompletions()
  }, [])

  const fetchCourses = async () => {
    try {
      // Fetch courses for all user's license types
      const coursePromises = userLicenseTypes.map(licenseType => 
        fetch(`/api/courses?licenseType=${licenseType}`)
      )
      
      const responses = await Promise.all(coursePromises)
      const allCourses: Course[] = []
      
      for (const response of responses) {
        if (response.ok) {
          const result = await response.json()
          allCourses.push(...result.courses)
        }
      }
      
      // Remove duplicates
      const uniqueCourses = allCourses.filter((course, index, self) => 
        index === self.findIndex(c => c.id === course.id)
      )
      
      setCourses(uniqueCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchUserCompletions = async () => {
    try {
      // This would need a separate API endpoint to get user's completions
      // For now, we'll simulate it
      setUserCompletions([])
    } catch (error) {
      console.error('Error fetching user completions:', error)
    }
  }

  const handleSubmitCompletion = async () => {
    if (!selectedCourse || !submission.screenshotUrl) return

    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submission)
      })

      if (response.ok) {
        setIsSubmissionDialogOpen(false)
        setSelectedCourse(null)
        setSubmission({ screenshotUrl: '', notes: '' })
        fetchUserCompletions()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit completion')
      }
    } catch (error) {
      console.error('Error submitting completion:', error)
      alert('Failed to submit completion')
    } finally {
      setLoading(false)
    }
  }

  const getUserCompletionStatus = (courseId: string) => {
    return userCompletions.find(completion => completion.courseId === courseId)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>
      default:
        return null
    }
  }

  const requiredCourses = courses.filter(course => course.requiredForCompliance)
  const optionalCourses = courses.filter(course => !course.requiredForCompliance)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Training Courses</h2>
          <p className="text-gray-600">Complete required courses and explore additional training</p>
        </div>
      </div>

      {requiredCourses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-600">Required for Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requiredCourses.map((course) => {
              const completion = getUserCompletionStatus(course.id)
              return (
                <Card key={course.id} className="border-red-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <BookOpen className="w-5 h-5 text-red-500" />
                      <Badge variant="outline" className="border-red-300 text-red-600">
                        {getLicenseTypeDisplayName(course.targetLicenseType)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.provider && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Provider:</span> {course.provider}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Estimated Time:</span> {course.estimatedHours} hours
                      </p>
                      
                      {completion && (
                        <div className="py-2">
                          {getStatusBadge(completion.status)}
                          {completion.status === 'REJECTED' && completion.adminNotes && (
                            <p className="text-xs text-red-600 mt-1">{completion.adminNotes}</p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {course.url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => window.open(course.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Take Course
                          </Button>
                        )}
                        {!completion && (
                          <Dialog open={isSubmissionDialogOpen && selectedCourse?.id === course.id} onOpenChange={(open) => {
                            setIsSubmissionDialogOpen(open)
                            if (!open) setSelectedCourse(null)
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => setSelectedCourse(course)}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Submit Completion
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Submit Course Completion</DialogTitle>
                                <DialogDescription>
                                  Upload a screenshot showing your completion of: {course.title}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="screenshot">Screenshot URL</Label>
                                  <Input
                                    id="screenshot"
                                    value={submission.screenshotUrl}
                                    onChange={(e) => setSubmission(prev => ({ ...prev, screenshotUrl: e.target.value }))}
                                    placeholder="https://example.com/screenshot.png"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Upload your screenshot to a file sharing service and paste the URL here
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                  <Textarea
                                    id="notes"
                                    value={submission.notes}
                                    onChange={(e) => setSubmission(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Any additional information about your completion"
                                    rows={3}
                                  />
                                </div>
                                <Button 
                                  onClick={handleSubmitCompletion} 
                                  disabled={loading || !submission.screenshotUrl}
                                  className="w-full"
                                >
                                  {loading ? 'Submitting...' : 'Submit for Review'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {optionalCourses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Training</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optionalCourses.map((course) => {
              const completion = getUserCompletionStatus(course.id)
              return (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      <Badge variant="outline">
                        {getLicenseTypeDisplayName(course.targetLicenseType)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.provider && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Provider:</span> {course.provider}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Estimated Time:</span> {course.estimatedHours} hours
                      </p>
                      
                      {completion && (
                        <div className="py-2">
                          {getStatusBadge(completion.status)}
                          {completion.status === 'REJECTED' && completion.adminNotes && (
                            <p className="text-xs text-red-600 mt-1">{completion.adminNotes}</p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {course.url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => window.open(course.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Take Course
                          </Button>
                        )}
                        {!completion && (
                          <Dialog open={isSubmissionDialogOpen && selectedCourse?.id === course.id} onOpenChange={(open) => {
                            setIsSubmissionDialogOpen(open)
                            if (!open) setSelectedCourse(null)
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => setSelectedCourse(course)}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Submit Completion
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Submit Course Completion</DialogTitle>
                                <DialogDescription>
                                  Upload a screenshot showing your completion of: {course.title}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="screenshot">Screenshot URL</Label>
                                  <Input
                                    id="screenshot"
                                    value={submission.screenshotUrl}
                                    onChange={(e) => setSubmission(prev => ({ ...prev, screenshotUrl: e.target.value }))}
                                    placeholder="https://example.com/screenshot.png"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Upload your screenshot to a file sharing service and paste the URL here
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                  <Textarea
                                    id="notes"
                                    value={submission.notes}
                                    onChange={(e) => setSubmission(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Any additional information about your completion"
                                    rows={3}
                                  />
                                </div>
                                <Button 
                                  onClick={handleSubmitCompletion} 
                                  disabled={loading || !submission.screenshotUrl}
                                  className="w-full"
                                >
                                  {loading ? 'Submitting...' : 'Submit for Review'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {courses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No courses available for your license types</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}