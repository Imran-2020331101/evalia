export const FAQ = [
    {
      question: "How to create an Evalia account?",
      answer: `
        For Candidates:
        1. Visit evalia Home Page.
        2. Click "Register"
        3. Fill out the registration form (name, email, password, phone)
        4. Click "Create Account"
        5. Verify email with OTP
        6. Enter the 6-digit OTP
        7. Account is ready to use

        For Recruiters/Organizations:
        1. Follow the same steps
        2. Select "Recruiter" during profile setup
        3. Provide company details (name, industry, size, location)
        4. Verify email
        5. Recruiter dashboard activated
      `
    },
    {
      question: "How to reset your password?",
      answer: `
        1. Go to /auth/login
        2. Click "Forgot Password?"
        3. Enter registered email
        4. Check your email for reset link
        5. Click link (valid for 15 minutes)
        6. Enter new password twice
        7. Click "Reset Password"
        8. Log in with new password

        Note: If you don't see the email, check spam or contact support.
              `
            },
            {
              question: "How to manage your profile and settings?",
              answer: `
        Access:
        1. Log into Evalia
        2. Click avatar > Profile Settings

        Options:
        - Personal Info: update name, email, phone
        - Professional Details: job title, company, experience
        - Privacy Settings
        - Notification Preferences
        - Account Security: password, login history

        Candidates: upload resume, add skills, set job preferences, manage applications  
        Recruiters: manage org profile, invite team, billing, integrations
      `
    },
    {
      question: "How to enable two-factor authentication?",
      answer: `
1. Go to Profile Settings > Security
2. Click "Enable Two-Factor Authentication"
3. Choose method (SMS/Email)
4. Enter code to confirm
5. Save backup codes
6. 2FA enabled

Using 2FA:
- After password, enter code sent via SMS/Email
- Codes expire in 5 minutes
- Use backup codes if needed
      `
    },
    {
      question: "How recruiters can create a job posting?",
      answer: `
1. Log into recruiter dashboard
2. Go to Workspace > Jobs
3. Click "Create New Job"
4. Fill in job details (title, type, location, salary, description, skills)
5. Configure interviews (duration, question types, criteria)
6. Preview and Publish
      `
    },
    {
      question: "How to manage job postings?",
      answer: `
1. Go to Workspace > Jobs
2. View active, draft, closed jobs

Actions: Edit, Pause, Clone, Archive, View Analytics  
Candidate Management: review/filter apps, schedule interviews, export reports  
Collaboration: share jobs, notes, approval workflows, tool integrations
      `
    },
    {
      question: "How candidates can apply to a job?",
      answer: `
Finding Jobs:
- Search/filter jobs in candidate dashboard
- Browse recommended jobs

Applying:
1. Open job
2. Review details
3. Check compatibility score
4. Click "Apply Now"
5. Resume auto-submitted
6. Add cover letter (optional)
7. Answer screening Qs
8. Submit

After Applying:
- Receive confirmation
- If shortlisted, get AI interview
- Track status in dashboard
      `
    },
    {
      question: "How to track application status?",
      answer: `
Dashboard:
1. Go to candidate dashboard
2. Open "My Applications"

Statuses:
- 🟡 Applied
- 🔵 Under Review
- 🟢 Interview Scheduled
- 🟠 Interview Completed
- ✅ Advanced
- ❌ Not Selected

Details: job info, compatibility score, interview results, recruiter feedback  
Notifications: real-time + email
      `
    },
    {
      question: "How to schedule AI-driven interviews?",
      answer: `
Recruiters:
1. Go to Workspace > Jobs > Candidate
2. Click "Schedule Interview"
3. Set deadline, duration, question set, evaluation
4. Send invitation

Candidates:
1. Open invite link
2. Choose time
3. Check system (camera, mic, internet)
4. Take interview
      `
    },
    {
      question: "How to view candidate evaluation results?",
      answer: `
Recruiters:
1. Go to Workspace > Jobs > Candidates
2. Select candidate
3. View results

Metrics:
- Technical Score
- Communication Score
- Integrity Score
- Compatibility

Analytics: per-question breakdown, speaking patterns, engagement, AI summary
      `
    },
    {
      question: "Understanding scoring metrics and video analysis?",
      answer: `
Integrity Scoring (0-100):
- Face Detection
- Eye Contact
- Speaking Pattern
- Blink Rate

Performance Scoring:
- Technical Competency (0-10)
- Communication Skills (0-10)
- Behavioral Analysis: engagement, confidence, cultural fit

Video Analysis:
- Real-time monitoring
- Emotion/sentiment analysis
- Speaking time balance
- Stress indicators
      `
    },
    {
      question: "How to export interview reports?",
      answer: `
Individual: export PDF, Excel, JSON from candidate results  
Bulk: select multiple candidates > Bulk Export > choose format  

Report includes: profile, transcript, scores, AI summary, comparison, charts  
Custom Builder: pick metrics, date range, add notes, branding
      `
    },
    {
      question: "Browser and device compatibility?",
      answer: `
Supported Browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+  
Device Requirements (Interviews): camera 720p+, mic with noise cancellation, 5 Mbps+, 4GB+ RAM  
Mobile: iOS 14+, Android 8+  
Systems: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
      `
    },
    {
      question: "Troubleshooting audio/video issues?",
      answer: `
Before Interview:
- Check permissions, drivers, browser, mic  
- Test internet speed  

During Interview:
- If video freezes: refresh, check net  
- If audio cuts: check mic, permissions, speak closer  

Emergency: pause up to 5 min, auto-recovery, support chat
      `
    },
    {
      question: "Error reporting and logging?",
      answer: `
Automatic: errors logged, alerts sent  
Manual:
- During Interview: click "Report Issue"  
- General: Profile > Support > Report Issue  

Logs: recruiters (org), candidates (own), support (full)  
Response Times: Critical <30m, High <2h, Medium <24h, Low <72h  
Support Channels: chat, email, phone, knowledge base, tutorials
      `
    },
    {
      question: "Additional support options?",
      answer: `
Community: forum, webinars, best practice guides  
Enterprise: account managers, custom integrations, training  
Updates: new features, maintenance notices, tutorials, feedback loops  

Contact: support@evalia.com or in-platform chat
      `
    }
  ]