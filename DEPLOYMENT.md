# Production Deployment Guide

This guide covers deploying the AI License Management Platform to production using Vercel and Supabase.

## Prerequisites

- Vercel account
- Supabase account  
- Domain name (optional)
- Email service credentials (Gmail/SendGrid)

## Database Setup (Supabase)

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com
   # Create new project
   # Note down your database URL and anon key
   ```

2. **Run Database Migrations**
   ```bash
   # Update your .env with Supabase DATABASE_URL
   npx prisma db push
   npx prisma generate
   ```

3. **Seed Initial Data** (Optional)
   ```bash
   # Create admin user and sample data
   npx prisma db seed
   ```

## Environment Variables

Create these environment variables in Vercel:

```bash
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]"

# Authentication
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-a-strong-random-string"

# Email Notifications
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"

# OpenAI API
OPENAI_API_KEY="your-openai-key"

# Cron Job Security
CRON_SECRET="generate-another-random-string"

# Optional: File Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

## Vercel Deployment

1. **Connect GitHub Repository**
   ```bash
   # Push code to GitHub
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to vercel.com
   - Import your GitHub repository  
   - Configure environment variables
   - Deploy!

3. **Set up Custom Domain** (Optional)
   - Add domain in Vercel dashboard
   - Configure DNS records
   - Enable SSL certificate

## Scheduled Tasks (Cron Jobs)

Set up these cron jobs in Vercel or GitHub Actions:

```yaml
# .github/workflows/cron-notifications.yml
name: Automated Notifications

on:
  schedule:
    # Daily at 9 AM UTC
    - cron: '0 9 * * *'
    # Weekly on Monday at 10 AM UTC  
    - cron: '0 10 * * 1'
    # Monthly on 1st at 11 AM UTC
    - cron: '0 11 1 * *'

jobs:
  daily-notifications:
    runs-on: ubuntu-latest
    steps:
      - name: Run Daily Tasks
        run: |
          curl -X POST https://your-domain.vercel.app/api/cron/notifications \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"task": "daily"}'

  weekly-notifications:
    runs-on: ubuntu-latest  
    if: github.event.schedule == '0 10 * * 1'
    steps:
      - name: Run Weekly Tasks
        run: |
          curl -X POST https://your-domain.vercel.app/api/cron/notifications \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"task": "weekly"}'

  monthly-notifications:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 11 1 * *'  
    steps:
      - name: Run Monthly Tasks
        run: |
          curl -X POST https://your-domain.vercel.app/api/cron/notifications \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{"task": "monthly"}'
```

## Post-Deployment Setup

1. **Create Admin User**
   ```sql
   -- Run in Supabase SQL Editor
   UPDATE users 
   SET role = 'ADMIN' 
   WHERE email = 'your-admin-email@company.com';
   ```

2. **Configure Email Templates**
   - Test email notifications
   - Customize email templates in `/api/notifications/email`
   - Set up proper from addresses

3. **Set up Monitoring**
   - Enable Vercel Analytics
   - Set up error tracking (Sentry)
   - Configure uptime monitoring

## Security Checklist

- [ ] Environment variables are properly set
- [ ] Database access is restricted
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] CRON_SECRET is properly configured
- [ ] Email credentials are secure
- [ ] API routes have proper authentication
- [ ] Rate limiting is enabled (if needed)

## Performance Optimization

1. **Database Indexing**
   ```sql
   -- Add indexes for performance
   CREATE INDEX idx_user_email ON users(email);
   CREATE INDEX idx_license_user_type ON user_licenses(userId, licenseType);
   CREATE INDEX idx_project_owner ON projects(ownerId);
   CREATE INDEX idx_notification_user_read ON notifications(userId, isRead);
   ```

2. **Caching Strategy**
   - Enable Vercel Edge Caching where appropriate
   - Consider Redis for session storage (optional)
   - Implement proper cache headers

## Backup and Recovery

1. **Database Backups**
   - Supabase provides automatic daily backups
   - Set up additional backup strategy if needed
   - Test restore procedures

2. **Data Retention**
   - Implement 7-year data retention policy
   - Archive old records as needed
   - Ensure GDPR/compliance requirements

## Monitoring and Maintenance

1. **Health Checks**
   ```bash
   # Add health check endpoint
   GET https://your-domain.vercel.app/api/health
   ```

2. **Log Monitoring**
   - Monitor Vercel Function logs
   - Set up alerts for errors
   - Track performance metrics

3. **Regular Updates**
   - Keep dependencies updated
   - Monitor for security vulnerabilities  
   - Regular database maintenance

## Scaling Considerations

- **Database**: Supabase scales automatically
- **API Routes**: Vercel Functions scale automatically  
- **Storage**: Use Vercel Blob for file uploads
- **CDN**: Vercel provides global CDN

The platform is now ready for production use with enterprise-grade features:
- ✅ Complete user management system
- ✅ Three-tier FTE analytics  
- ✅ AI-powered business case processing
- ✅ Comprehensive course management
- ✅ Automated notification system
- ✅ Gamification and achievements
- ✅ Admin compliance monitoring
- ✅ Audit trails and reporting