import React, { FC, useEffect, useState } from 'react';
import CelebritySection from './CelebritySection';
import UserSection from './UserSection';
import CallStatus from './CallStatus';
import CallButton from './CallButton';
import { io } from 'socket.io-client';

interface CallInterfaceProps {
  imageUrl: string;
  name: string;
  voice_id: string;
  onClose: () => void;
}

const CallInterface: FC<CallInterfaceProps> = ({
  imageUrl,
  name,
  voice_id,
  onClose,
}) => {
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [celebritySpeaking, setCelebritySpeaking] = useState(false);
  const [callTime, setCallTime] = useState<number>(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const ringtoneUrl = '/audio/ringtone.mp3';

  useEffect(() => {
    // Initialize mediaRecorder when the component mounts
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
    });
  }, []);

  useEffect(() => {
    // Set up socket connection and audio playback logic
    if (mediaRecorder) {
      const newSocket = io('ws://localhost:6900');

      newSocket.on('connect', () => {
        console.log('Connected to socket');
        newSocket.emit('getDetails', { personName: name, voice_id: voice_id });

        mediaRecorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0) {
            newSocket.emit('packet-sent', event.data);
          }
        });
        mediaRecorder.start(500);
      });

      newSocket.on('audioData', async (arrayBuffer: ArrayBuffer) => {
        setUserSpeaking(false);
        setMicrophoneMute(true);
        setCelebritySpeaking(true);

        try {
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const audioSource = audioContext.createBufferSource();
          audioSource.buffer = audioBuffer;
          audioSource.connect(audioContext.destination);
          audioSource.start(0);

          audioSource.onended = () => {
            setCelebritySpeaking(false);
            setMicrophoneMute(false);
            setUserSpeaking(true);
          };
        } catch (error) {
          console.error('Error decoding or playing audio:', error);
          setCelebritySpeaking(false);
          setMicrophoneMute(false);
          setUserSpeaking(false);
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [mediaRecorder]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const setMicrophoneMute = (mute: boolean) => {
    if (mediaRecorder) {
      const tracks = mediaRecorder.stream.getAudioTracks();
      tracks.forEach((track) => {
        track.enabled = !mute;
      });
    }
  };

  const handleCloseModal = () => {
    // Stop the media recorder, disconnect the socket, and close the modal
    mediaRecorder?.stop();
    setCallTime(0);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center backdrop-filter backdrop-blur-sm'>
      <div className='container flex flex-col items-center justify-center gap-12 mx-auto rounded-lg max-w-3xl w-full relative'>
        <div className='p-4 max-w-xl w-full flex items-center justify-between'>
          <CelebritySection
            imageUrl={imageUrl}
            name={name}
            isSpeaking={celebritySpeaking}
          />
          <UserSection isSpeaking={userSpeaking} />
        </div>
        <CallStatus callTime={callTime} />
        <CallButton onClick={handleCloseModal} />
      </div>
    </div>
  );
};

export default CallInterface;
