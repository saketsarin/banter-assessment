import { Deepgram } from '@deepgram/sdk';
import { LiveTranscription } from '@deepgram/sdk/dist/transcription/liveTranscription';
import dotenv from 'dotenv';

dotenv.config();

let keepAlive: NodeJS.Timeout;

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || '';

type TranscriptReceivedEventHandler = (data: string) => Promise<void>;

export function getDeepgramLiveConnection(
  transcriptReceivedEventHandler: TranscriptReceivedEventHandler
): LiveTranscription | null {
  if (!DEEPGRAM_API_KEY) {
    console.error('Deepgram API key is missing.');
    return null;
  }

  // Instantiate Deepgram object with the API key
  const deepgram = new Deepgram(DEEPGRAM_API_KEY);
  const deepgramLive = deepgram.transcription.live({
    model: 'nova-2',
    language: 'en-US',
    punctuate: true,
    smart_format: true,
  });

  // Clear keepAlive if it's been set, and restart it
  function clearKeepAlive() {
    if (keepAlive) clearInterval(keepAlive);
  }
  clearKeepAlive();
  keepAlive = setInterval(() => {
    deepgramLive.keepAlive();
  }, 10 * 1000);

  // Add event listeners for open, close, and error
  deepgramLive.addListener('open', async () => {
    console.log('Deepgram: connected');

    deepgramLive.addListener('close', async (data) => {
      console.log('Deepgram: disconnected');
      clearInterval(keepAlive);
      deepgramLive.finish();
    });

    deepgramLive.addListener('error', async (error) => {
      console.log('Deepgram: error received');
      console.error(error);
    });
  });

  // Add event listener for transcriptReceived - passed in by caller
  deepgramLive.addListener(
    'transcriptReceived',
    transcriptReceivedEventHandler
  );

  return deepgramLive;
}
