import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

export const config = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '1025'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        // Get user from database with role and department
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            licenses: true,
          },
        })
        
        session.user.id = user.id
        session.user.role = dbUser?.role || 'MEMBER'
        session.user.department = dbUser?.department || undefined
        session.user.licenses = dbUser?.licenses || []
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'database',
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: 'MEMBER' | 'ADMIN'
      department?: 'SME' | 'LAKA' | 'ONBOARDING' | 'SPECIALSERVICE' | 'WFM' | 'CX'
      licenses: Array<{
        licenseType: 'COPILOT_ADVANCED' | 'COPILOT_STUDIO' | 'POWER_AUTOMATE'
        isActive: boolean
      }>
    }
  }

  interface User {
    role?: 'MEMBER' | 'ADMIN'
    department?: 'SME' | 'LAKA' | 'ONBOARDING' | 'SPECIALSERVICE' | 'WFM' | 'CX'
  }
}