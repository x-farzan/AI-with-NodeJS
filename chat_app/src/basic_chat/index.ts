import OpenAI from "openai";
import { encoding_for_model } from "tiktoken";

// openAI initialization
const client = new OpenAI();

// static variables
const model = "gpt-5-nano-2025-08-07";
const MAX_TOKENS = 4000;
const encoder = encoding_for_model(model); // breaks the text into tokens

// types
type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
const context: ChatMessage[] = [
  {
    role: "system",
    content: "You are a helpful assistant.",
  },
];

// CLI input / starting point
console.log("Welcome to the chat! Type your message and press Enter.");
process.stdin.addListener("data", async (input) => {
  const userInput = input.toString().trim();
  context.push({
    role: "user",
    content: userInput,
  });

  await chatCompletion();
});

/**
 *          Helper Functions
 */
async function chatCompletion() {
  const response = await client.responses.create({
    model: model,
    input: context,
  });
  const outputMessage = response.output_text;

  context.push({
    role: "assistant",
    content: outputMessage,
  });
  if (response.usage && response.usage.total_tokens > MAX_TOKENS) {
    await deleteOlderMessagesFromContext();
  }

  console.log(outputMessage);
}

// Implementation for deleting older messages from context
async function deleteOlderMessagesFromContext() {
  const contextLength = await getContextlength();

  while (contextLength > MAX_TOKENS) {
    for (let i = 0; i < context.length; i++) {
      const message = context[i];
      if (message.role != "system") {
        context.splice(i, 1);
        break;
      }
    }
  }
}

// Get the length of the context in terms of tokens
async function getContextlength() {
  let length = 0;

  context.forEach((message) => {
    if (typeof message.content === "string") {
      length += encoder.encode(message.content).length;
    }
    // else if (Array.isArray(message.content)) {
    //   message.content.forEach((messageContent) => {
    //     if (messageContent.type == "text") {
    //       length += encoder.encode(messageContent).length;
    //     }
    //   });
    // }
  });

  return length;
}
