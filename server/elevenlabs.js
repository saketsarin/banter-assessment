import axios from 'axios';

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

const options = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model_id: 'eleven_monolingual_v1',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
    },
    xi_api_key: process.env.ELEVENLABS_API_KEY,
  }),
};

async function convertToSpeechAndPlay(personName, text) {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text,
        speaker: personName,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ELEVENLABS_API_KEY}`,
        },
      }
    );

    const audioUrl = response.data.audioUrl;

    // Play the audio response
    const audio = new Audio(audioUrl);
    audio.play();

    return { audioUrl, responseData: response.data };
  } catch (error) {
    console.error('Error converting text to speech with Eleven Labs:', error);
    throw error;
  }
}

export { convertToSpeechAndPlay };
