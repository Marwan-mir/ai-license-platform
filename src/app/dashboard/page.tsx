import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { isProjectLicenseType } from "@/lib/utils"
import { ProjectDashboard } from "@/components/dashboard/project-dashboard"
import { TrainingDashboard } from "@/components/dashboard/training-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  // Admin users get the admin dashboard
  if (session.user.role === 'ADMIN') {
    return <AdminDashboard user={session.user} />
  }

  // Check if user has any project-based licenses (Copilot Studio or Power Automate)
  const hasProjectLicenses = session.user.licenses.some(license => 
    license.isActive && isProjectLicenseType(license.licenseType)
  )

  if (hasProjectLicenses) {
    return <ProjectDashboard user={session.user} />
  }

  // Default to training-only dashboard (for Copilot Advanced users)
  return <TrainingDashboard user={session.user} />
}