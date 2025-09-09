import OpenAI from "openai";

// Typed OpenRouter client wrapper
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER ?? "http://localhost:7000",
    "X-Title": "evalia upskill engine",
  },
});

export async function sendToLLM(message: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
  });

  const content = completion.choices?.[0]?.message?.content as unknown;

  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    // Content parts (for multi-part responses in some providers)
    return content
      .map((part: any) => (typeof part === "string" ? part : (part?.text ?? "")))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

export default sendToLLM;
