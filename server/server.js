import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { startLiveTranscription, stopLiveTranscription } from './deepgram.js';
import { sendToOpenAI } from './openai.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Ensure to restrict this in production!
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Access-Control-Allow-Origin'],
  },
});

const PORT = process.env.PORT || 6900;

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
    stopLiveTranscription(); // Consider passing any necessary arguments
  });

  socket.on('userSpeaking', async (audioBlob, selectedPerson) => {
    console.log('Received audio data from client');
    try {
      await startLiveTranscription(socket, audioBlob, selectedPerson);
    } catch (error) {
      console.error('Error during live transcription:', error);
      socket.emit('transcriptionError', { error: error.message });
    }
  });

  socket.on('userStoppedSpeaking', async (name, transcript) => {
    console.log('User stopped speaking');
    stopLiveTranscription();

    if (transcript && transcript.length > 0) {
      try {
        await sendToOpenAI(name, transcript, socket);
      } catch (error) {
        console.error('Error sending data to OpenAI:', error);
        socket.emit('openaiError', { error: error.message });
      }
    }
  });

  socket.on('celebritySpeaking', (selectedPerson) => {
    console.log('Celebrity speaking:', selectedPerson);
    // Handle celebrity speaking event if necessary
  });

  socket.on('end-call', () => {
    console.log('Call ended');
    stopLiveTranscription(); // Consider passing any necessary arguments
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
