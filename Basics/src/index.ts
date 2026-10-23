import OpenAI from "openai";
import { encoding_for_model } from "tiktoken";

const client = new OpenAI();

async function main() {
  const response = await client.responses.create({
    model: "gpt-5-nano-2025-08-07",
    input: [
      {
        role: "user",
        content: "Write a one-sentence bedtime story about a unicorn.",
      },
    ],
  });

  console.log(response.output_text);
}

async function encodePrompt() {
  const prompt = "Write a one-sentence bedtime story about a unicorn.";
  const encoder = encoding_for_model("gpt-5-nano-2025-08-07");
  const words = encoder.encode(prompt);
  console.log(words);
}

// main().catch(console.error);
encodePrompt()
