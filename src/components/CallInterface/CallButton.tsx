import { FC } from 'react';
import { FaPhoneAlt } from 'react-icons/fa';

interface CallButtonProps {
  onClick: () => void;
}

const CallButton: FC<CallButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className='bg-red-500 hover:bg-red-600 text-white p-4 rounded-full'
    >
      <FaPhoneAlt />
    </button>
  );
};

export default CallButton;
