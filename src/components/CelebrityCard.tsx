'use client';

import { FC, useState } from 'react';
import { FaPhone } from 'react-icons/fa';
import CallInterface from './CallInterface/CallInterface';

interface CelebrityCardProps {
  imageUrl: string;
  name: string;
  voice_id: string;
}

const CelebrityCard: FC<CelebrityCardProps> = ({
  imageUrl,
  name,
  voice_id,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCall = () => {
    setShowModal(true);
  };

  return (
    <div className='flex flex-col items-center space-y-5 relative'>
      <div className='relative flex flex-col items-center justify-center'>
        <div className='rounded-full overflow-hidden border-4 border-green-500 w-28 h-28 flex items-center justify-center'>
          <img
            src={imageUrl}
            alt={name}
            className='w-full h-full object-cover border-opacity-50 border-green-500'
          />
        </div>
        <button
          onClick={handleCall}
          className='bg-green-500 hover:bg-green-600 text-white p-3 rounded-full flex items-center absolute -bottom-4'
        >
          <FaPhone />
        </button>
      </div>
      <div className='flex flex-col items-center'>
        <p className='text-center text-white'>{name}</p>
      </div>
      {showModal && (
        <CallInterface
          imageUrl={imageUrl}
          name={name}
          voice_id={voice_id}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CelebrityCard;
