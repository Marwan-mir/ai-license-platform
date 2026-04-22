'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Users, Building, BarChart3 } from "lucide-react"
import { formatFTE, getDepartmentDisplayName } from "@/lib/utils"

interface FTEAnalyticsProps {
  isAdmin?: boolean
  userId?: string
}

export function FTEAnalytics({ isAdmin = false, userId }: FTEAnalyticsProps) {
  const [activeLevel, setActiveLevel] = useState<'organization' | 'member' | 'project'>('organization')
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    if (isAdmin) {
      fetchMembers()
      fetchProjects()
    }
  }, [isAdmin])

  useEffect(() => {
    fetchFTEData()
  }, [activeLevel, selectedMember, selectedProject])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (response.ok) {
        const result = await response.json()
        setMembers(result.members || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const result = await response.json()
        setProjects(result.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchFTEData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        level: activeLevel,
        ...(selectedMember && { memberId: selectedMember }),
        ...(selectedProject && { projectId: selectedProject })
      })

      const response = await fetch(`/api/analytics/fte?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching FTE data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderOrganizationView = () => {
    if (!data) return null

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-3xl font-bold">{data.summary?.totalProjects || 0}</p>
                  <p className="text-xs text-gray-500">Active projects</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Community Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-3xl font-bold">{data.summary?.totalMembers || 0}</p>
                  <p className="text-xs text-gray-500">License holders</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total FTE Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-3xl font-bold">{formatFTE(data.summary?.totalFTE || 0)}</p>
                  <p className="text-xs text-gray-500">Full-time equivalent</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-3xl font-bold">
                    {formatFTE((data.summary?.totalFTE || 0) / Math.max(data.monthlyTrends?.length || 1, 1))}
                  </p>
                  <p className="text-xs text-gray-500">FTE per month</p>
                </div>
                <Building className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>
              FTE savings by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.departmentFTE?.map((dept: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{getDepartmentDisplayName(dept.department)}</p>
                    <p className="text-sm text-gray-500">{dept.project_count} projects</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatFTE(dept.total_fte_reduction || 0)}</p>
                    <p className="text-xs text-gray-500">FTE saved</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Projects</CardTitle>
            <CardDescription>
              Projects with highest FTE savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProjects?.slice(0, 5).map((project: any, index: number) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-gray-500">
                      Owner: {project.owner?.name} • {getDepartmentDisplayName(project.owner?.department)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{formatFTE(project.estimatedSavings || 0)}</p>
                    <p className="text-xs text-gray-500">Estimated FTE</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderMemberView = () => {
    if (!data) return null

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Member Performance</CardTitle>
            <CardDescription>
              {data.member?.name} - {getDepartmentDisplayName(data.member?.department)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{data.summary?.totalProjects || 0}</p>
                <p className="text-sm text-gray-500">Total Projects</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{formatFTE(data.summary?.totalFTE || 0)}</p>
                <p className="text-sm text-gray-500">Total FTE Savings</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{formatFTE(data.summary?.avgFTEPerProject || 0)}</p>
                <p className="text-sm text-gray-500">Avg FTE per Project</p>
              </div>
            </div>

            <div className="space-y-4">
              {data.projects?.map((project: any) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatFTE(project.fteAnalytics?.reduce((acc: number, fa: any) => acc + fa.fteReduction, 0) || 0)}
                    </p>
                    <p className="text-xs text-gray-500">FTE Contribution</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderProjectView = () => {
    if (!data) return null

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Analytics</CardTitle>
            <CardDescription>
              {data.project?.name} - {getDepartmentDisplayName(data.project?.department)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{formatFTE(data.summary?.totalFTE || 0)}</p>
                <p className="text-sm text-gray-500">Total FTE Saved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{Math.round(data.summary?.totalHours || 0)}</p>
                <p className="text-sm text-gray-500">Hours Saved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{formatFTE(data.summary?.monthlyAvgFTE || 0)}</p>
                <p className="text-sm text-gray-500">Monthly Avg FTE</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{data.project?.status}</p>
                <p className="text-sm text-gray-500">Project Status</p>
              </div>
            </div>

            {/* Monthly FTE Trends */}
            {data.project?.fteAnalytics?.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Monthly FTE Trends</h4>
                {data.project.fteAnalytics.map((analytics: any) => (
                  <div key={analytics.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(analytics.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{formatFTE(analytics.fteReduction)}</p>
                      <p className="text-xs text-gray-500">{analytics.hoursSaved}h saved</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">FTE Analytics</h2>
          <p className="text-gray-600">Track productivity gains and efficiency improvements</p>
        </div>
      </div>

      <Tabs value={activeLevel} onValueChange={(value) => setActiveLevel(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Organization
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="member" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Member
            </TabsTrigger>
          )}
          <TabsTrigger value="project" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Project
          </TabsTrigger>
        </TabsList>

        {/* Selection Controls */}
        <div className="flex gap-4 items-center">
          {activeLevel === 'member' && isAdmin && (
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name || member.email} - {getDepartmentDisplayName(member.department)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {activeLevel === 'project' && (
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="organization">
          {loading ? (
            <div className="text-center py-8">Loading organization analytics...</div>
          ) : (
            renderOrganizationView()
          )}
        </TabsContent>

        <TabsContent value="member">
          {!selectedMember ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Select a member to view their FTE analytics</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">Loading member analytics...</div>
          ) : (
            renderMemberView()
          )}
        </TabsContent>

        <TabsContent value="project">
          {!selectedProject ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Select a project to view its FTE analytics</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">Loading project analytics...</div>
          ) : (
            renderProjectView()
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}