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
function getFlightsBetween(origin: string, destination: string) {
  const flightCodes: string[] = [];
  const flightCount = Math.floor(Math.random() * 10) + 1;

  for (let i = 0; i <= flightCount; i++) {
    const flightSerialGenerator = Math.floor(Math.random() * 90000) + 10000;
    flightCodes.push(`PK-${flightSerialGenerator}`);
  }

  return `There are ${flightCount} flights : ${flightCodes.join(", ")}`;
}
function bookFlight(flightSerial: string) {
  // Excluded easily confused characters like O, 0, I, 1
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let i = 0; i < flightSerial.length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
}

// STEP 2: Register function with OpenAI
const tools: any[] = [
  {
    type: "function",
    name: "getFlightsBetween",
    description: "Get flights between two cities.",
    parameters: {
      type: "object",
      properties: {
        origin: {
          type: "string",
          description: "The origin city.",
        },
        destination: {
          type: "string",
          description: "The destination city.",
        },
      },
    },
    required: ["origin", "destination"],
    strict: false,
  },
  {
    type: "function",
    name: "bookFlight",
    description: "Book a flight.",
    parameters: {
      type: "object",
      properties: {
        flightSerial: {
          type: "string",
          description: "The serial number of the flight to book.",
        },
      },
    },
    required: ["flightSerial"],
    strict: false,
  },
];

const context: ChatMessage[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant that can list the flights and book them",
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
    tool_choice: "required",
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
  if (toolCall.name === "getFlightsBetween") {
    const { origin, destination } = JSON.parse(toolCall.arguments);
    toolResp = getFlightsBetween(origin, destination);
  } else if (toolCall.name === "bookFlight") {
    const { flightSerial } = JSON.parse(toolCall.arguments);
    toolResp = bookFlight(flightSerial);
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

console.log("Want to book a flight? I'm here for you :)");
process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim();
  context.push({
    role: "user",
    content: userInput,
  });

  await main();
});
