# AI License Management Platform - Development Instructions

This is a Next.js 14 TypeScript project for managing AI license holders across an organization.

## Project Overview
- **Purpose**: Community management platform for AI license tracking
- **License Types**: Copilot Advanced, Copilot Studio, Power Automate
- **Key Features**: Project tracking, course management, FTE analytics, gamification
- **Target Departments**: SME, LAKA, Onboarding, SpecialService, WFM, CX

## Development Checklist

- [x] ✅ Verify that the copilot-instructions.md file in the .github directory is created.
- [x] ✅ Clarify Project Requirements (COMPLETED - Requirements gathered)
- [x] ✅ Scaffold the Project (Next.js 14 with TypeScript and Tailwind CSS created)
- [x] ✅ Customize the Project (Core authentication and dashboard components implemented)
- [ ] Install Required Extensions
- [x] ✅ Compile the Project (Successfully builds without errors)
- [ ] Create and Run Task
- [x] ✅ Launch the Project (Development server running at http://localhost:3000)
- [ ] Ensure Documentation is Complete

## Technical Stack
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Authentication**: NextAuth.js with email verification codes
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI API for business case processing
- **Hosting**: Vercel with Supabase database
- **File Storage**: Vercel Blob for screenshots and documents

## Key Requirements
1. **Dual User Experience**: Different dashboards for project users vs training-only users
2. **Three-Tier FTE Analytics**: Organization → Member → Project level reporting
3. **Automated Course Verification**: OCR-based screenshot approval with audit trails
4. **Admin Controls**: Comprehensive oversight with compliance alerts
5. **Gamification**: Department-based competitions with digital badges
6. **Compliance**: 7-year data retention and audit-ready reporting