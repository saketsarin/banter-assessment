import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// define a simple interface for getting the next message in the chat.
export async function getOpenAIChatCompletion(
  personName: string,
  newMessage: string
): Promise<string> {
  // define initial message as the system prompt for the celebrity
  const messages: Array<ChatCompletionMessageParam> = [
    {
      role: 'system',
      content: `You are ${personName}. Do not write any explanations and only answer like  ${personName} would. 
      You must know all of the knowledge of ${personName}. Respond as ${personName} would, with wit and personality.`,
    },
  ];

  // Add the user's message
  messages.push({
    role: 'user',
    content: newMessage,
  });

  // Get chat completion by sending all previous messages, including the latest one
  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
  });
  return chatCompletion.choices[0].message.content || '';
}
