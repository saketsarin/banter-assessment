import { FC, useState, useEffect } from 'react';
import GreenWavesAnimation from '@/components/Animations/GreenWavesAnimation';
import { FaMicrophoneSlash, FaMicrophone } from 'react-icons/fa';

interface CelebritySectionProps {
  imageUrl: string;
  name: string;
  isSpeaking: boolean;
}

const CelebritySection: FC<CelebritySectionProps> = ({
  imageUrl,
  name,
  isSpeaking,
}) => {
  const [showWaves, setShowWaves] = useState(false);

  useEffect(() => {
    setShowWaves(isSpeaking);
  }, [isSpeaking]);

  return (
    <div className='flex flex-col items-center gap-8'>
      <GreenWavesAnimation isActive={showWaves}>
        <img
          src={imageUrl}
          alt={name}
          className='w-40 h-40 rounded-full object-cover m-2'
        />
      </GreenWavesAnimation>
      <h2 className='text-xl font-bold'>{name}</h2>
    </div>
  );
};

export default CelebritySection;
