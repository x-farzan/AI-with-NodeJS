import OpenAI from "openai";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const client = new OpenAI();
const context: ChatMessage[] = [
  {
    role: "system",
    content: "You are a helpful assistant.",
  },
];

async function chatCompletion() {
  const response = await client.responses.create({
    model: "gpt-5-nano-2025-08-07",
    input: context,
  });
  const outputMessage = response.output_text;

  context.push({
    role: "assistant",
    content: outputMessage,
  });
  console.log(outputMessage);
}

process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim();
  context.push({
    role: "user",
    content: userInput,
  });
  await chatCompletion();
});
