import { FC, useState, useEffect, useRef } from 'react';
import CelebritySection from './CelebritySection';
import UserSection from './UserSection';
import CallStatus from './CallStatus';
import CallButton from './CallButton';

import useSocket from '@/hooks/useSocket';

interface CallInterfaceProps {
  imageUrl: string;
  name: string;
  onClose: () => void;
}

const CallInterface: FC<CallInterfaceProps> = ({ imageUrl, name, onClose }) => {
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [celebritySpeaking, setCelebritySpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIndicatorRef = useRef<HTMLDivElement | null>(null);
  let lastUserSpeechTime = Date.now();

  const socket: any = useSocket('http://localhost:6900');

  const handleMuteMicrophone = () => {
    if (userSpeaking) {
      socket.emit('userStoppedSpeaking');

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setUserSpeaking(false);
      }
    } else {
      handleUnmuteMicrophone();
    }
  };

  const handleUnmuteMicrophone = () => {
    console.log('Unmuting microphone');
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'recording'
    ) {
      console.log('Starting media recorder');

      const mediaRecorder = mediaRecorderRef.current;
      // mediaRecorder.ondataavailable = (e) => {
      //   if (e.data.size > 0 && socket.connected) {
      //     console.log('Sending audio data:', e.data);
      //     socket.emit('userSpeaking', e.data, name);
      //   }
      // };

      mediaRecorder.start();
      setUserSpeaking(true);
      lastUserSpeechTime = Date.now();
    }
  };

  useEffect(() => {
    if (socket) {
      socket.emit('call', { celebrity: name });

      socket.on('celebritySpeaking', (isSpeaking: boolean) => {
        setCelebritySpeaking(isSpeaking);
      });
    }

    const handleMediaStream = async (stream: MediaStream) => {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0 && socket.connected) {
          console.log('Sending audio data:', e.data);
          socket.emit('userSpeaking', e.data, name);
        }
      };

      mediaRecorder.onstart = () => {
        console.log('Recording started');
        if (recordingIndicatorRef.current) {
          recordingIndicatorRef.current.style.display = 'block';
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped');
        if (recordingIndicatorRef.current) {
          recordingIndicatorRef.current.style.display = 'none';
        }
      };

      mediaRecorder.onerror = (err) => {
        console.error('MediaRecorder error:', err);
      };

      mediaRecorder.start();
      setUserSpeaking(true);
      mediaRecorderRef.current = mediaRecorder;
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(handleMediaStream)
      .catch((err) => {
        console.error('Error accessing user media:', err);
      });

    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === 'recording'
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [socket]);

  const handleCloseModal = () => {
    socket.emit('end-call');
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
        <CallStatus />
        <CallButton onClick={handleCloseModal} />

        <button onClick={handleMuteMicrophone}>Mute</button>
      </div>
    </div>
  );
};

export default CallInterface;
