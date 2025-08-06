const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",

  apiKey: process.env.OPEN_ROUTER_API_KEY,

  defaultHeaders: {
    "HTTP-Referer": "http://localhost:7000", 
    "X-Title": "evalia upskill engine", 
  },
});

async function upskillBot(message) {
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

  return response.content;
}

module.exports = upskillBot;
