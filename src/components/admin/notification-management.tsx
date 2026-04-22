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
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  Calendar,
  Send,
  Eye,
  EyeOff
} from "lucide-react"
import { getDepartmentDisplayName, formatDate } from "@/lib/utils"

interface ComplianceData {
  score: number
  totalUsers: number
  issues: {
    expiringLicenses: number
    pendingSubmissions: number
    inactiveProjects: number
    overdueReviews: number
  }
  details: {
    expiringLicenses: any[]
    pendingSubmissions: any[]
    inactiveProjects: any[]
    overdueReviews: any[]
  }
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isUrgent: boolean
  isRead: boolean
  createdAt: Date
}

export function NotificationManagement() {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    isUrgent: false,
    targetAudience: 'all'
  })

  useEffect(() => {
    fetchComplianceData()
    fetchNotifications()
  }, [])

  const fetchComplianceData = async () => {
    try {
      const response = await fetch('/api/admin/compliance')
      if (response.ok) {
        const result = await response.json()
        setComplianceData(result.compliance)
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const result = await response.json()
        setNotifications(result.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) return

    setLoading(true)
    try {
      // This would need implementation to send to multiple users based on targetAudience
      // For now, we'll create a single notification
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newNotification,
          userId: 'admin-broadcast' // This would be handled differently in real implementation
        })
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setNewNotification({
          title: '',
          message: '',
          type: 'general',
          isUrgent: false,
          targetAudience: 'all'
        })
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error creating notification:', error)
    } finally {
      setLoading(false)
    }
  }

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 75) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'license':
        return <Calendar className="w-4 h-4" />
      case 'course':
        return <FileText className="w-4 h-4" />
      case 'project':
        return <Clock className="w-4 h-4" />
      case 'review':
        return <Users className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Management</h2>
          <p className="text-gray-600">Monitor compliance and manage system alerts</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create System Alert</DialogTitle>
              <DialogDescription>Send notifications to community members</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Alert Title</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter alert title"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter alert message"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="type">Alert Type</Label>
                <Select value={newNotification.type} onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={newNotification.targetAudience} onValueChange={(value) => setNewNotification(prev => ({ ...prev, targetAudience: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="SME">SME Department</SelectItem>
                    <SelectItem value="LAKA">LAKA Department</SelectItem>
                    <SelectItem value="ONBOARDING">Onboarding Department</SelectItem>
                    <SelectItem value="SPECIALSERVICE">Special Service Department</SelectItem>
                    <SelectItem value="WFM">WFM Department</SelectItem>
                    <SelectItem value="CX">CX Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={newNotification.isUrgent}
                  onCheckedChange={(checked) => setNewNotification(prev => ({ ...prev, isUrgent: checked as boolean }))}
                />
                <Label htmlFor="urgent">Mark as Urgent</Label>
              </div>
              <Button onClick={handleCreateNotification} disabled={loading} className="w-full">
                {loading ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="compliance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compliance">Compliance Monitor</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance">
          {complianceData && (
            <div className="space-y-6">
              {/* Compliance Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Overall Compliance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${getComplianceScoreColor(complianceData.score)}`}>
                        {complianceData.score}%
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Based on {complianceData.totalUsers} license holders</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Status: {
                        complianceData.score >= 90 ? 'Excellent' :
                        complianceData.score >= 75 ? 'Good' : 'Needs Attention'
                      }</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Issues Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-orange-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-orange-600">Expiring Licenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-orange-600">{complianceData.issues.expiringLicenses}</p>
                        <p className="text-xs text-gray-500">Next 30 days</p>
                      </div>
                      <Calendar className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-600">Pending Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-red-600">{complianceData.issues.pendingSubmissions}</p>
                        <p className="text-xs text-gray-500">Course completions</p>
                      </div>
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-600">Inactive Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-yellow-600">{complianceData.issues.inactiveProjects}</p>
                        <p className="text-xs text-gray-500">No updates 30+ days</p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-600">Overdue Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-blue-600">{complianceData.issues.overdueReviews}</p>
                        <p className="text-xs text-gray-500">Bi-annual reviews</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Issues */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Critical Issues</CardTitle>
                    <CardDescription>Items requiring immediate attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {complianceData.details.expiringLicenses.slice(0, 5).map((license: any) => (
                        <div key={license.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="font-medium text-sm">{license.user.name || license.user.email}</p>
                              <p className="text-xs text-gray-500">License expires {formatDate(new Date(license.expiryDate))}</p>
                            </div>
                          </div>
                          <Badge variant="destructive">Urgent</Badge>
                        </div>
                      ))}
                      {complianceData.details.pendingSubmissions.filter(s => s.course.isMandatory).slice(0, 3).map((submission: any) => (
                        <div key={submission.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="font-medium text-sm">{submission.user.name || submission.user.email}</p>
                              <p className="text-xs text-gray-500">Required course: {submission.course.name}</p>
                            </div>
                          </div>
                          <Badge variant="destructive">Required</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-yellow-600">Attention Needed</CardTitle>
                    <CardDescription>Items to review soon</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {complianceData.details.inactiveProjects.slice(0, 4).map((project: any) => (
                        <div key={project.id} className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <div>
                              <p className="font-medium text-sm">{project.name}</p>
                              <p className="text-xs text-gray-500">Owner: {project.owner.name} • Last update {formatDate(new Date(project.updatedAt))}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Stale</Badge>
                        </div>
                      ))}
                      {complianceData.details.overdueReviews.slice(0, 3).map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-yellow-500" />
                            <div>
                              <p className="font-medium text-sm">{user.name || user.email}</p>
                              <p className="text-xs text-gray-500">{getDepartmentDisplayName(user.department)} • Review overdue</p>
                            </div>
                          </div>
                          <Badge variant="secondary">Overdue</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Active System Alerts</CardTitle>
              <CardDescription>Current notifications and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Active alert monitoring coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>Past notifications and delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Notification history coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}