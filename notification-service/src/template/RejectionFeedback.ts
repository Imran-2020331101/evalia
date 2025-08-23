export const generateRejectionFeedbackEmail = (
  notification: {
    userName: string;
    type: string;
    jobTitle: string;
    jobId: string;
    stage: string;
    compatibility_review: {
      matchPercentage: number;
      fit: 'Best Fit' | 'Good Fit' | 'Average' | 'Bad Fit';
      strengths: string[];
      weaknesses: string[];
    };
  }
): string => {
  const { userName, jobTitle, stage, compatibility_review } = notification;
  const { matchPercentage, fit, strengths, weaknesses } = compatibility_review;

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
        <h2 style="color: #d9534f;">Application Update</h2>
        <p>Dear ${userName},</p>

        <p>
          Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position. 
          After careful review at the <strong>${stage}</strong> stage, we regret to inform you 
          that we will not be moving forward with your application at this time.
        </p>

        <h3 style="color: #0275d8;">Your Compatibility Review</h3>
        <p>
          Although this role wasn’t the ideal match, we would like to share some constructive feedback 
          that may help you in your future applications:
        </p>

        <ul style="list-style: none; padding: 0;">
          <li><strong>Match Percentage:</strong> ${matchPercentage}%</li>
          <li><strong>Overall Fit:</strong> ${fit}</li>
        </ul>

        <h4 style="color: #5cb85c;">Strengths</h4>
        <ul>
          ${strengths.length > 0 
            ? strengths.map((strength) => `<li>${strength}</li>`).join('') 
            : "<li>No strengths highlighted</li>"}
        </ul>

        <h4 style="color: #f0ad4e;">Areas for Improvement</h4>
        <ul>
          ${weaknesses.length > 0 
            ? weaknesses.map((weakness) => `<li>${weakness}</li>`).join('') 
            : "<li>No improvement areas identified</li>"}
        </ul>

        <p>
          Please don’t be discouraged — every application is an opportunity to learn and grow. 
          We encourage you to continue developing your skills and pursuing roles that align closely with your strengths. 
        </p>

        <p style="margin-top: 20px;">Wishing you success in your career journey,</p>
        <p><strong>The Hiring Team</strong></p>
      </body>
    </html>
  `;
};
