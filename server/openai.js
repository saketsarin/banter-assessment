import OpenAI from 'openai';
import dotenv from 'dotenv';
import { convertToSpeechAndPlay } from './elevenlabs.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function sendToOpenAI(personName, transcript, socket) {
  try {
    const systemMessage = `I want you to act like ${personName}. I want you to respond and answer like that person only. Do not write any explanations and only answer like the character would. You must know all of the knowledge of character. I have called you right now and you have to say the first sentence.`;

    const systemResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: systemMessage }],
    });

    console.log(`${personName}: ${systemResponse.choices[0].message.content}`);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: transcript },
        {
          role: 'assistant',
          content: systemResponse.choices[0].message.content,
        },
      ],
    });

    console.log(`${personName}: ${response.choices[0].message.content}`);

    // socket.emit('openaiResponse', {
    //   personName,
    //   response: response.choices[0].message.content,
    // });

    await convertToSpeechAndPlay(
      personName,
      response.choices[0].message.content
    );
  } catch (error) {
    console.error('Error sending data to OpenAI:', error);
  }
}

export { sendToOpenAI };
