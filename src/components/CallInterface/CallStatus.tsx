import { FC } from 'react';

interface CallStatusProps {
  callTime: number;
}

const CallStatus: FC<CallStatusProps> = ({ callTime }) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <p className='text-md text-gray-400 mt-4'>
      {callTime === 0 ? 'Calling...' : formatTime(callTime)}
    </p>
  );
};

export default CallStatus;
