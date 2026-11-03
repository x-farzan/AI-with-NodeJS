import OpenAI from "openai";
import { encoding_for_model } from "tiktoken";

// types
type ChatMessage = {
  role: "system" | "user";
  content: string;
  tool_call_id?: string;
};

const client = new OpenAI();
const model = "gpt-5-nano-2025-08-07";

// STEP 1: Actual JavaScript function
function getTimeOfTheDay() {
  return "5:45 PM";
}

// STEP 2: Register function with OpenAI
const tools: any[] = [
  {
    type: "function",
    name: "getTimeOfTheDay",
    description: "Get the current time of the day.",
    parameters: {},
    strict: false,
  },
];

const context: ChatMessage[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant that can provide the current time of the day.",
  },
  // {
  //   role: "user",
  //   content: "What is the time of the day?",
  // },
];

async function main() {
  // STEP 3: Send user prompt and available tools
  const response = await client.responses.create({
    model: model,
    input: context,
    tools,
    tool_choice: "auto",
  });

  // STEP 4: Find the requested function
  const toolCall = response.output.find(
    (item) => item.type === "function_call",
  );

  if (!toolCall) {
    console.log(response.output_text);
    return;
  }

  // STEP 5: Execute the actual function
  const toolResp = getTimeOfTheDay();

  // STEP 6: Send function result back to OpenAI
  const finalResponse = await client.responses.create({
    model: model,
    previous_response_id: response.id,
    input: [
      {
        type: "function_call_output",
        call_id: toolCall.call_id,
        output: toolResp,
      },
    ],
    tools,
  });

  // STEP 7: Display final AI response
  console.log(finalResponse.output_text);
}

console.log("Welcome to the chat! Type your message and press Enter.");
process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim();
  context.push({
    role: "user",
    content: userInput,
  });

  await main();
});
