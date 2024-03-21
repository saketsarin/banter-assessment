import { FC } from 'react';
import { celebrities } from '@/constant/const';
import CelebrityCard from '@/components/CelebrityCard';

const Home: FC = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='container mx-auto p-12'>
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-5xl font-bold text-white'>
            Your Favorite Celebrities
          </h1>
          <p className='text-lg text-gray-300 mt-2'>
            Talk to your favorite celebrities with just one click, lightning
            fast, and secure.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-12'>
          {celebrities?.map((celebrity, index) => (
            <CelebrityCard
              key={index}
              imageUrl={celebrity.imageUrl}
              name={celebrity.name}
              voice_id={celebrity.voiceId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
