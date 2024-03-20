import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { startLiveTranscription, stopLiveTranscription } from './deepgram.js';
import { sendToOpenAI } from './openai.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Access-Control-Allow-Origin'],
  },
});

const PORT = process.env.PORT || 6900;

io.on('connection', (socket) => {
  let userSpeakingData = [];

  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('userSpeaking', async (userSpeaking, selectedPerson) => {
    console.log('Received audio data from client');

    try {
      // Start live transcription
      await startLiveTranscription(socket, userSpeaking, selectedPerson);
    } catch (error) {
      console.error('Error during live transcription:', error.message);
      socket.emit('transcriptionError', { error: error.message });
    }
  });

  socket.on('userStoppedSpeaking', async () => {
    console.log('User stopped speaking');
    stopLiveTranscription(socket);

    // await sendToOpenAI(selectedPerson, transcript, socket);
  });

  socket.on('userTranscriptData', (transcriptData) => {
    console.log('Received transcript data from client');
    userSpeakingData.push(transcriptData);

    console.log('User speaking data:', userSpeakingData);
  });

  socket.on('celebritySpeaking', (selectedPerson) => {
    console.log('Received audio data from client');
  });

  socket.on('end-call', () => {
    console.log('Call ended');
    stopLiveTranscription(socket);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
