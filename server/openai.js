import OpenAI from 'openai';
import dotenv from 'dotenv';
import { convertToSpeechAndPlay } from './elevenlabs.js';
import { PassThrough } from 'stream';

dotenv.config();

const passThrough = new PassThrough();

async function sendToOpenAI(personName, transcript, socket) {
  const systemMessage = `I want you to act like ${personName}. I want you to respond and answer like that person only. Do not write any explanations and only answer like the character would. You must know all of the knowledge of character. I have called you right now and you have to say the first sentence.`;

  console.log(`${personName}: ${systemResponse.choices[0].message.content}`);

  axios({
    method: 'post',
    url: 'https://api.openai.com/v1/chat/completions',
    data: {
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [{ role: 'user', content: systemMessage }],
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    responseType: 'stream',
  })
    .then((response) => {
      response.data.pipe(passThrough);
    })
    .catch((error) => {
      logger.error(
        'Error from OpenAI in FinalResponseStreaming: ' +
          JSON.stringify(error) +
          JSON.stringify(socket.request?.sessionID)
      );
      throw new Error(
        'Error from OpenAI in FinalResponseStreaming: ' + JSON.stringify(error)
      );
    });

  passThrough.on('data', (chunk) => {
    const payloads = chunk.toString().split('\n\n');

    for (const payload of payloads) {
      if (payload.includes('[DONE]')) {
        continue;
      }

      try {
        const regex = /"delta":\{(?:"role":".?",)?\s"content":".*?"\}/;
        const data = payload.match(regex);
        const dataStr = data && JSON.stringify(`{${data[0]}}`);

        const delta = dataStr && JSON.parse(dataStr);

        const newTextChunk = JSON.parse(delta)?.delta?.content;

        if (newTextChunk) {
          sendResponse += newTextChunk;
          socket.emit('openaiResponse', newTextChunk);
        }
      } catch (error) {
        if (chunk.toString().length > 0) {
          // Incomplete JSON string, wait for more data
          continue;
        } else {
        }
      }
    }
  });

  console.log(`${personName}: ${response.choices[0].message.content}`);
}

// await convertToSpeechAndPlay(
//   personName,
//   response.choices[0].message.content
// );

export { sendToOpenAI };
