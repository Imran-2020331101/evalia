import { InterviewInvitationPayload } from "../types/interview-invitation.payload";
export const generateInterviewInvitationMail = (
  notification: InterviewInvitationPayload
): string => {
  const { 
    candidateName, 
    jobTitle, 
    OrganizationName = 'Our Company',
    OrganizationEmail,
    deadline,
    interviewLink,
    guideLink = '/interview-guide',
    recruiterName = 'The Hiring Team',
    additionalNotes
  } = notification;

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #e0e6ed; padding: 20px; max-width: 600px; margin: 0 auto; background: #0f1419;">
        <div style="background: linear-gradient(135deg, #1a2332 0%, #0f1419 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; border: 1px solid #2d3748;">
          <h1 style="color: #64b5f6; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          <p style="color: #a0aec0; margin: 10px 0 0 0; font-size: 16px;">You've been selected for the AI Interview round</p>
        </div>
        
        <div style="background: #1a2332; padding: 30px; border: 1px solid #2d3748; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px; color: #e0e6ed;">Dear ${candidateName},</p>
          
          <p style="margin-bottom: 20px; color: #cbd5e0;">
            We're excited to inform you that you've successfully progressed to the <strong style="color: #64b5f6;">AI Interview</strong> stage 
            for the <strong style="color: #64b5f6;">${jobTitle}</strong> position at ${OrganizationName}!
          </p>
          
          <div style="background: #0f1419; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4299e1; border: 1px solid #2d3748;">
            <h3 style="color: #4299e1; margin-top: 0;">🤖 AI Interview Details</h3>
            
            <p><strong>📅 Deadline:</strong> Complete by ${deadline}</p>
            <p><strong>⏰ Flexibility:</strong> Take the interview anytime that's convenient for you before the deadline</p>
            
            <div style="margin: 20px 0;">
              <p><strong>� Start Your Interview:</strong></p>
              <a href="${interviewLink}" 
                 style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 10px 0;">
                Begin AI Interview
              </a>
              <p style="font-size: 14px; color: #6c757d; margin-top: 10px;">
                This is your unique interview room. You can start anytime before the deadline.
              </p>
            </div>
            
            ${recruiterName && OrganizationEmail ? `
              <p><strong>📧 Support Contact:</strong> <a href="mailto:${OrganizationEmail}" style="color: #007bff;">${OrganizationEmail}</a></p>
            ` : ''}
          </div>
          
          <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #007bff;">
            <h4 style="color: #0066cc; margin-top: 0;">📚 How It Works</h4>
            <p style="color: #0066cc; margin-bottom: 15px;">
              Our AI interviewer will conduct a conversational interview through text chat. 
              The process is designed to be natural and assess your skills comprehensively.
            </p>
            
            <a href="${guideLink}" 
               style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 5px;">
              � Read Interview Guide
            </a>
            <p style="font-size: 14px; color: #6c757d; margin-top: 10px;">
              Learn about the interview process, types of questions, and tips for success.
            </p>
          </div>
          
         
          <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <p style="color: #721c24; margin: 0; font-weight: bold;">
              Important: Complete your interview before ${deadline}. 
              Late submissions will not be considered.
            </p>
          </div>
          
          <p style="margin: 25px 0;">
            If you encounter any technical issues or have questions about the process, please contact us 
            ${OrganizationEmail ? `at <a href="mailto:${OrganizationEmail}" style="color: #007bff;">${OrganizationEmail}</a>` : 'immediately'}.
          </p>
          
          <p style="margin-bottom: 10px;">Best of luck with your AI interview!</p>
          
          <p style="margin-top: 30px; color: #6c757d;">
            Best regards,<br/>
            <strong>Evalia</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 14px;">
          <p>This is an automated message. Please contact support if you need assistance.</p>
        </div>
      </body>
    </html>
  `;
};