'use client';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const NUM_DIVS = 5;

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

const FloatingBackground = () => {
  const [divs, setDivs] = useState<any>([]);

  useEffect(() => {
    const newDivs = Array.from({ length: NUM_DIVS }, (_, i) => ({
      id: i,
      size: getRandom(250, 400),
      top: getRandom(0, 100),
      left: getRandom(0, 100),
    }));
    setDivs(newDivs);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {divs.map(({ id, size, top, left }: any) => (
        <FloatingBall key={id} size={size} top={top} left={left} />
      ))}
    </div>
  );
};

const FloatingBall = ({ size, top, left }: any) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [duration, setDuration] = useState(getRandom(13, 20));

  useEffect(() => {
    animateToNewPosition();
  }, []);

  const animateToNewPosition = () => {
    setX(getRandom(-window.innerWidth, window.innerWidth));
    setY(getRandom(-window.innerHeight, window.innerHeight));
    setDuration(getRandom(13, 20));
  };

  return (
    <motion.div
      className="neon-glow absolute rounded-full"
      style={{
        width: size,
        height: size,
        top: `${top}%`,
        left: `${left}%`,
      }}
      animate={{ x, y }}
      transition={{
        duration,
        ease: "easeInOut",
      }}
      onAnimationComplete={animateToNewPosition}
    />
  );
};

export default FloatingBackground;
