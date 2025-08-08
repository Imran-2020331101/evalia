const overviewPrompt = (
  resumeContext,
  jobDescription
) => `You are a helpful assistant. Compare the following resume to the job description.
Return a short overview with:
- Overall fit (0-100)
- Top matching skills
- Key gaps
- Brief reasoning (max 5 lines)

RESUME:
${resumeContext}

JOB DESCRIPTION:
${jobDescription}`;
