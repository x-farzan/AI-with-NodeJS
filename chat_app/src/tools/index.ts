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
function getWeatherOfCity(city: string) {
  if (city === "Lahore")
    return "The weather in Lahore is cloudy with a temperature of 30°C.";
  if (city === "karachi")
    return "The weather in Karachi is rainy with a temperature of 28°C.";
  if (city === "Islamabad")
    return "The weather in Islamabad is sunny with a temperature of 32°C.";
  return "No weather information available for the specified city.";
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
  {
    type: "function",
    name: "getWeatherOfCity",
    description: "Get the weather of a specific city.",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "The name of the city to get the weather for.",
        },
      },
    },
    required: ["city"],
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
  let toolResp: string = "";
  if (toolCall.name === "getTimeOfTheDay") {
    toolResp = getTimeOfTheDay();
  } else if (toolCall.name === "getWeatherOfCity") {
    const { city } = JSON.parse(toolCall.arguments);
    toolResp = getWeatherOfCity(city);
  } else {
    return;
  }

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
