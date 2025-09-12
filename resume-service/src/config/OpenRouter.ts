import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5000', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': 'evalia', // Optional. Site title for rankings on openrouter.ai.
  },
});

async function ResumeBot(message: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    //takes an average time of 3 min to process resume
    // model: "deepseek/deepseek-r1-0528-qwen3-8b:free",

    //takes an average time of 15 sec to process resume
    model: 'openai/gpt-4o-mini-2024-07-18',
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
    max_tokens: 4000,
    temperature: 0.1, 
  });

  const response = completion.choices[0].message;

  return response.content || '';
}

export default ResumeBot;