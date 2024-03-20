import React, { FC } from 'react';
import './styles.css';

interface GreenWavesAnimationProps {
  isActive: boolean;
  children?: React.ReactNode;
}

const GreenWavesAnimation: FC<GreenWavesAnimationProps> = ({
  isActive,
  children,
}) => {
  return (
    <div className={`green-waves ${isActive ? 'active' : ''}`}>{children}</div>
  );
};

export default GreenWavesAnimation;
