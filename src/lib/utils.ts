import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// License type display functions
export function getLicenseTypeDisplayName(licenseType: string): string {
  switch (licenseType) {
    case 'COPILOT_ADVANCED':
      return 'GitHub Copilot Advanced'
    case 'COPILOT_STUDIO':
      return 'Copilot Studio'
    case 'POWER_AUTOMATE':
      return 'Power Automate'
    default:
      return licenseType
  }
}

export function isProjectLicenseType(licenseType: string): boolean {
  return ['COPILOT_ADVANCED', 'COPILOT_STUDIO'].includes(licenseType)
}

// Department display function
export function getDepartmentDisplayName(department: string): string {
  switch (department) {
    case 'SME':
      return 'Subject Matter Expert'
    case 'LAKA':
      return 'LAKA Department'
    case 'ONBOARDING':
      return 'Onboarding'
    case 'SPECIALSERVICE':
      return 'Special Service'
    case 'WFM':
      return 'Workforce Management'
    case 'CX':
      return 'Customer Experience'
    default:
      return department
  }
}

// FTE calculation and formatting
export function calculateFTE(hoursSaved: number): number {
  // Standard working hours per month: 26.25 days * 8 hours = 210 hours
  // But we'll use a more realistic 26.25 * 4.33 weeks * 8 hours / 4 = 26.25 * 8.66 = 227.325
  // Simplified to 26.25 * 8 = 210 for easier calculation
  const HOURS_PER_FTE_MONTH = 210
  return Number((hoursSaved / HOURS_PER_FTE_MONTH).toFixed(3))
}

export function formatFTE(fte: number): string {
  if (fte < 0.001) return '< 0.001'
  if (fte < 0.1) return fte.toFixed(3)
  if (fte < 1) return fte.toFixed(2)
  return fte.toFixed(1)
}

// Date formatting function
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
