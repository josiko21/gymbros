import { createOpenAI } from "@ai-sdk/openai";

export function getDeepSeek() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }

  return createOpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });
}

export const deepseekModel = "deepseek-chat";
