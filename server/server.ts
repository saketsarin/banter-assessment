import http from 'http';
import dotenv from 'dotenv';
import { Server, Socket } from 'socket.io';
import { getDeepgramLiveConnection } from './deepgram';
import { getOpenAIChatCompletion } from './openai';
import { getElevenLabsAudio } from './elevenlabs';
import { LiveTranscription } from '@deepgram/sdk/dist/transcription/liveTranscription';

dotenv.config();

const server = http.createServer();

const socketIOServer = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    allowedHeaders: ['Content-Type', 'Access-Control-Allow-Origin'],
  },
});

let clientSocket: Socket;
let personName: string = '';
let voice_id: string = '';

socketIOServer.on('connection', (socket) => {
  console.log('*******client connected');
  clientSocket = socket;

  // Send initial message from the celebrity once the client connects
  // const initialMessage = `Hello, I am ${personName}. Let's start our conversation.`;
  // clientSocket.emit('celebritySpeaking', initialMessage);

  // after connection, an event is emitted to the client to get the person's name and voice_id
  socket.on('getDetails', (data) => {
    personName = data.personName;
    voice_id = data.voice_id;
  });

  socket.on('packet-sent', (data) => {
    const readyState = deepgramLive?.getReadyState();

    if (readyState === 1) {
      deepgramLive?.send(data);
    } else {
      console.log(
        `socket: data couldn't be sent to deepgram. readyState was ${readyState}`
      );
    }
  });

  socket.on('disconnect', () => {
    console.log('socket: client disconnected');
  });
});

server.listen(process.env.PORT, () => {
  console.log(`server listening on port ${process.env.PORT}`);
});

const deepgramLive: LiveTranscription | null = getDeepgramLiveConnection(
  async (data: string) => {
    const transcriptData = JSON.parse(data);
    if (transcriptData.type !== 'Results') {
      return;
    }

    const transcript = transcriptData.channel.alternatives[0].transcript ?? '';
    if (transcript) {
      console.log(`transcript received: "${transcript}"`);

      const openAIResponse = await getOpenAIChatCompletion(
        personName,
        transcript
      );
      console.log(`openAIResponse: ${openAIResponse}`);

      const elevenLabsAudio = await getElevenLabsAudio(
        openAIResponse,
        voice_id
      );

      if (!clientSocket.connected) {
        console.log('socket: client not connected');
      }

      if (clientSocket) {
        clientSocket.emit('audioData', elevenLabsAudio);
        console.log('sent audio data to frontend: ', elevenLabsAudio);

        // Allow user to speak after celebrity's message is received
        setTimeout(() => {
          clientSocket.emit('celebritySpeaking', true);
        }, 5000);
      }
    }
  }
);

export default server;
