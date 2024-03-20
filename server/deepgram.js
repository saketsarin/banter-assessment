import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import dotenv from 'dotenv';

dotenv.config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
let connection;

const startLiveTranscription = (socket, audioData, name) => {
  connection = deepgram.listen.live({
    model: 'nova-2',
    language: 'en-US',
    smart_format: true,
  });

  const userSpeakingData = [];

  connection.once(LiveTranscriptionEvents.Open, () => {
    console.log('Transcription connection opened');
    if (connection) {
      connection.send(audioData);
    }
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data) => {
    const transcript = data.channel.alternatives[0].transcript;
    console.log('You:', transcript);
    userSpeakingData.push(transcript);
  });

  connection.on(LiveTranscriptionEvents.Close, async () => {
    console.log('Connection closed', name, userSpeakingData);
    await stopLiveTranscription();
    socket.emit('userStoppedSpeaking', name, userSpeakingData);
  });

  connection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error('Deepgram transcription error:', err);
    stopLiveTranscription();
    socket.emit('transcriptionError', err.message);
  });

  return connection;
};

const stopLiveTranscription = () => {
  console.log('Stopping live transcription');
  if (connection && connection.isActive) {
    connection.finish();
    console.log('Transcription connection finished');
  } else {
    console.warn('No active transcription connection to close.');
  }
};

export { startLiveTranscription, stopLiveTranscription };
