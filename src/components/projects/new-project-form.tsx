'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Loader2, FileText, HelpCircle } from "lucide-react"
import { getDepartmentDisplayName } from "@/lib/utils"

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

interface NewProjectFormProps {
  user: User
}

export function NewProjectForm({ user }: NewProjectFormProps) {
  const [activeTab, setActiveTab] = useState('freetext')
  const [isLoading, setIsLoading] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [businessCaseText, setBusinessCaseText] = useState('')
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({})
  const [questions] = useState([
    "What is the main purpose of this AI project?",
    "Which department will benefit most from this project?", 
    "How many hours per week do you expect to save?",
    "What specific tasks will be automated or improved?",
    "What quality improvements do you expect to see?"
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        name: projectName,
        description: projectDescription,
        businessCase: activeTab === 'freetext' ? businessCaseText : guidedAnswers,
        inputType: activeTab
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        window.location.href = '/dashboard'
      } else {
        throw new Error('Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateGuidedAnswer = (question: string, answer: string) => {
    setGuidedAnswers(prev => ({ ...prev, [question]: answer }))
  }

  const isFormValid = projectName && projectDescription && (
    (activeTab === 'freetext' && businessCaseText) ||
    (activeTab === 'guided' && Object.keys(guidedAnswers).length >= 3)
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Project Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>
            Start by providing basic details about your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter a descriptive name for your project"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="projectDescription">Project Description *</Label>
            <Textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Provide a brief overview of what this project aims to achieve"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Select defaultValue={user.department}>
              <SelectTrigger>
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SME">{getDepartmentDisplayName('SME')}</SelectItem>
                <SelectItem value="LAKA">{getDepartmentDisplayName('LAKA')}</SelectItem>
                <SelectItem value="ONBOARDING">{getDepartmentDisplayName('ONBOARDING')}</SelectItem>
                <SelectItem value="SPECIALSERVICE">{getDepartmentDisplayName('SPECIALSERVICE')}</SelectItem>
                <SelectItem value="WFM">{getDepartmentDisplayName('WFM')}</SelectItem>
                <SelectItem value="CX">{getDepartmentDisplayName('CX')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Business Case */}
      <Card>
        <CardHeader>
          <CardTitle>Business Case</CardTitle>
          <CardDescription>
            Help us understand the value and impact of your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="freetext" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Freetext Input
              </TabsTrigger>
              <TabsTrigger value="guided" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Guided Questions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="freetext" className="mt-4">
              <div>
                <Label htmlFor="businessCase">Business Case *</Label>
                <Textarea
                  id="businessCase"
                  value={businessCaseText}
                  onChange={(e) => setBusinessCaseText(e.target.value)}
                  placeholder="Paste your existing business case or describe the project purpose, expected benefits, time savings, and quality improvements..."
                  rows={8}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Our AI will analyze your text to extract key metrics and categorize the project benefits.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="guided" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Answer these questions to help us build your business case:
                </p>
                {questions.map((question, index) => (
                  <div key={index}>
                    <Label htmlFor={`question-${index}`}>{question}</Label>
                    <Textarea
                      id={`question-${index}`}
                      value={guidedAnswers[question] || ''}
                      onChange={(e) => updateGuidedAnswer(question, e.target.value)}
                      placeholder="Your answer..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                ))}
                <p className="text-sm text-gray-500">
                  Our AI will process your answers to create a structured business case.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isFormValid || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Create Project'
          )}
        </Button>
      </div>
    </form>
  )
}