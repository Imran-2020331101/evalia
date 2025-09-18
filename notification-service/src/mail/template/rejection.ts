import { RejectionMailPayload} from "../types/rejection-mail.type"

export const generateRejectionFeedbackEmail = (
  notification:RejectionMailPayload
): string => {
  const { candidateName, jobTitle, data } = notification;
  const { matchPercentage, fit, strengths, weaknesses  } = data.review;

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.7; color: #e2e8f0; padding: 30px; background: #0f172a; max-width: 700px; margin: auto; border-radius: 12px; box-shadow: 0 0 25px rgba(0,0,0,0.6);">

        <h2 style="color: #ef4444; margin-bottom: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
          Application Decision
        </h2>

        <p style="margin-bottom: 16px;">Dear <span style="color: #38bdf8;">${candidateName}</span>,</p>

        <p style="margin-bottom: 20px;">
          Thank you sincerely for the time and effort you put into applying for the 
          <strong style="color: #60a5fa;">${jobTitle}</strong> role. 
          After a thorough review at the 
          <strong style="color: #60a5fa;">${data.stage}</strong> stage, we regret to inform you 
          that we have decided not to move forward with your application. 
          This was not an easy decision, as we truly value the commitment shown by every candidate.
        </p>

        <h3 style="color: #60a5fa; margin-top: 30px; margin-bottom: 12px;">Some Insights from Your Application</h3>
        <p style="margin-bottom: 20px;">
          Although this particular role may not have been the perfect fit, we’d like to share some constructive feedback 
          that could support your future opportunities:
        </p>

        <h4 style="color: #10b981; margin-top: 20px; margin-bottom: 10px;">Where You Excelled</h4>
        <div style="border: 1px solid #1e293b; background: #1e293b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
          <ul style="padding-left: 20px; margin: 0;">
            ${
              strengths.length > 0 
              ? strengths.map((strength) => `<li style="color: #cbd5e1; margin-bottom: 6px;">✔ ${strength}</li>`).join('') 
              : "<li style=\"color: #64748b;\">No specific strengths highlighted</li>"
            }
          </ul>
        </div>

        <h4 style="color: #f59e0b; margin-top: 20px; margin-bottom: 10px;">Opportunities to Grow</h4>
        <div style="border: 1px solid #1e293b; background: #1e293b; padding: 12px 16px; border-radius: 8px; margin-bottom: 25px;">
          <ul style="padding-left: 20px; margin: 0;">
            ${
              weaknesses.length > 0 
              ? weaknesses.map((weakness) => `<li style="color: #cbd5e1; margin-bottom: 6px;">✖ ${weakness}</li>`).join('') 
              : "<li style=\"color: #64748b;\">No key growth areas identified</li>"
            }
          </ul>
        </div>

        ${
          data?.interviewEvaluation && `Check your interview evaluation here : ${data.interviewEvaluation}`
        }

        <p style="margin-bottom: 20px;">
          Please don’t be discouraged — every step in the process adds value to your journey. 
          We encourage you to continue building on your strengths, addressing areas of growth, 
          and exploring opportunities that align closely with your skills and aspirations.
        </p>

        <p style="margin-top: 20px; color: #94a3b8;">
          We truly appreciate the effort you invested and wish you every success in your career ahead.
        </p>
        <p><strong style="color: #38bdf8;">The Hiring Team</strong></p>
      </body>
    </html>
  `;
};


