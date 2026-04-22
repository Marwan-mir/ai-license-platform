import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const session = await auth()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI License Hub
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Community management platform for AI license tracking and project collaboration
          </p>
          <Link href="/auth/signin">
            <Button size="lg">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Project Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track AI projects, document business cases, and measure time efficiency across your organization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete mandatory training courses and maintain compliance with automated verification.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FTE Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Measure productivity gains and calculate FTE savings with comprehensive reporting tools.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Supported License Types
          </h2>
          <div className="flex justify-center space-x-8 text-gray-600">
            <span>Copilot Advanced</span>
            <span>•</span>
            <span>Copilot Studio</span>
            <span>•</span>
            <span>Power Automate</span>
          </div>
        </div>
      </div>
    </div>
  )
}