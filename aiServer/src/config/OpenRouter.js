const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",

  apiKey: process.env.OPEN_ROUTER_API_KEY,

  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "evalia", // Optional. Site title for rankings on openrouter.ai.
  },
});

async function ResumeBot(message) {
  const completion = await openai.chat.completions.create({
    model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
  });

  const response = completion.choices[0].message;

  console.log(response);
  return response;
}

module.exports = ResumeBot;
