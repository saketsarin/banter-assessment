import GreenWavesAnimation from '@/components/Animations/GreenWavesAnimation';
import { FC, useState, useEffect } from 'react';
import { FaMicrophoneSlash, FaMicrophone } from 'react-icons/fa';

interface UserSectionProps {
  isSpeaking: boolean;
}

const UserSection: FC<UserSectionProps> = ({ isSpeaking }) => {
  const [showWaves, setShowWaves] = useState(false);

  useEffect(() => {
    setShowWaves(isSpeaking);
  }, [isSpeaking]);

  return (
    <div className='flex flex-col items-center gap-6'>
      <GreenWavesAnimation isActive={showWaves}>
        <div className='flex flex-col items-center justify-center gap-2 w-40 h-40 m-2 rounded-full'>
          <div className='text-white font-bold text-xl'>You</div>
          {showWaves ? (
            <FaMicrophone className='text-xl' />
          ) : (
            <FaMicrophoneSlash className='text-xl' />
          )}
        </div>
      </GreenWavesAnimation>

      <h2 className='text-transparent'>You</h2>
    </div>
  );
};

export default UserSection;
