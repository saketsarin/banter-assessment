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
  const [callTime, setCallTime] = useState<number>(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const socket: any = useSocket('http://localhost:6900');

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder: any = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        });

        mediaRecorder.ondataavailable = (event: any) => {
          if (event.data.size > 0 && socket.connected) {
            socket.emit('userSpeaking', event.data, name);
          }
        };

        mediaRecorder.onstart = () => {
          startCallTimer();
        };
        mediaRecorder.onstop = () => {
          stopCallTimer();
        };

        mediaRecorder.start();
        setUserSpeaking(true);
      } catch (error) {
        console.error('Error accessing user media:', error);
      }
    };

    socket?.on('celebritySpeaking', setCelebritySpeaking);
    startRecording();

    return () => {
      socket?.off('celebritySpeaking');
      stopCallTimer();
    };
  }, [socket, name]);

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
  };

  const toggleMicrophone = () => {
    if (userSpeaking) {
      // socket.emit('userStoppedSpeaking');
      setUserSpeaking(false);
    } else {
      setUserSpeaking(true);
    }
  };

  const handleCloseModal = () => {
    socket.emit('end-call');
    onClose();
    setCallTime(0);
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
        <button onClick={toggleMicrophone}>
          {userSpeaking ? 'Mute' : 'Unmute'}
        </button>
      </div>
    </div>
  );
};

export default CallInterface;
