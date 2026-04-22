import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { NewProjectForm } from "@/components/projects/new-project-form"

export default async function NewProjectPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  // Only allow users with project licenses
  const hasProjectLicenses = session.user.licenses.some(license => 
    license.isActive && (license.licenseType === 'COPILOT_STUDIO' || license.licenseType === 'POWER_AUTOMATE')
  )

  if (!hasProjectLicenses) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600">Define your AI project and business case</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewProjectForm user={session.user} />
      </main>
    </div>
  )
}