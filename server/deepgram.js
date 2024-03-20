import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import dotenv from 'dotenv';

dotenv.config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
let connection;

const startLiveTranscription = (socket, audioData) => {
  connection = deepgram.listen.live({
    model: 'nova-2',
    language: 'en-US',
    smart_format: true,
  });
  return new Promise((resolve, reject) => {
    connection.once(LiveTranscriptionEvents.Open, () => {
      resolve(connection);
    });

    connection.on(LiveTranscriptionEvents.Error, (err) => {
      reject(err);
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      console.log('You: ', data.channel.alternatives[0].transcript);
      socket.emit(
        'userTranscriptData',
        data.channel.alternatives[0].transcript
      );
    });
  })
    .then(() => {
      if (connection) {
        connection.send(audioData);
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

const stopLiveTranscription = () => {
  console.log('Stopping live transcription');
  if (connection) {
    connection.finish();
  } else {
    console.warn('Connection is not open.');
  }
};

export { startLiveTranscription, stopLiveTranscription };
