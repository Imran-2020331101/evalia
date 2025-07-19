'use client';

import { useEffect, useRef } from 'react';
import { Syncopate } from 'next/font/google';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/all';

const blinker = Syncopate({
  weight: ['400', '700'],
  subsets: ['latin'],
});

gsap.registerPlugin(SplitText);

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const redRefs = useRef<HTMLDivElement[]>([]);

  useGSAP(() => {
    const startAnimation = () => {
      const heroSplit = new SplitText('.hero', { type: 'words' });
      const heroGradientSplit = new SplitText('.hero-gradient', { type: 'words' });
      const descriptionSplit = new SplitText('.description', { type: 'lines' });

      heroGradientSplit.words.forEach((el) => {
        (el as HTMLElement).classList.add(
          'inline-block',
          'bg-gradient-to-t',
          'from-blue-900',
          'via-blue-400',
          'to-blue-100',
          'bg-clip-text',
          'text-transparent'
        );
      });


      gsap.set(['.hero', '.hero-gradient', '.description'], { visibility: 'visible' });

      gsap.from(heroSplit.words, {
        yPercent: 100,
        opacity: 0,
        duration: 1.8,
        ease: 'expo.out',
        stagger: 0.04,
      });
      gsap.from(heroGradientSplit.words, {
        yPercent: 100,
        opacity: 0,
        duration: 1.8,
        ease: 'expo.out',
        stagger: 0.05,
        delay: 0.3,
      });
      gsap.from(descriptionSplit.lines, {
        opacity: 0,
        yPercent: 100,
        duration: 1.8,
        ease: 'expo.out',
        stagger: 0.03,
        delay: 0.5,
      });
    };

    if (document.fonts.status === 'loaded') {
      startAnimation();
    } else {
      document.fonts.ready.then(startAnimation);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      const centerY = rect.height / 2;
      const offsetY = ((relY - centerY) / centerY) * 80;

      redRefs.current.forEach((el, i) => {
        if (!el) return;
        const direction = i % 2 === 0 ? 1 : -1;
        gsap.to(el, {
          y: offsetY * direction,
          duration: 0.2,
          ease: 'expo',
        });
      });
    };

    container?.addEventListener('mousemove', handleMouseMove);
    return () => container?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen flex flex-col justify-end relative shrink-0"
    >
      <div className="w-full absolute bottom-0 right-0 top-0 flex justify-center items-end">
        <div className="w-[50%] h-[80%] flex justify-center items-center gap-[16px]">
          {[0, 1, 2, 3, 4].map((i) => {
            const isTall = i === 3;
            const extraClass =
              i === 3
                ? 'h-[110%] mt-[-40px] ml-[12px]'
                : i === 4
                ? 'h-[80%] ml-[-15px]'
                : i === 1
                ? 'h-[80%]'
                : 'h-full';

            return (
              <div
                key={i}
                className={`w-[10%] ${extraClass} border-[1px] flex justify-center items-center border-neutral-800 rotate-[35deg]`}
              >
                <div
                  ref={(el) => {
                    if (el) redRefs.current[i] = el;
                  }}
                  className="w-[90%] h-[80%] bg-[rgba(100,149,237,0.25)] shadow-[0_0_20px_8px_rgba(100,149,237,0.4),0_0_40px_20px_rgba(100,149,237,0.25)] rounded transition-transform duration-500"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-full flex flex-col justify-end absolute bg-gray-950/90">
        <div className="w-full h-[40%] flex justify-between">
          <div className="w-[60%] h-full px-[50px]">
            <div
              className={`${blinker.className} flex flex-col justify-start items-start gap-[3px] lg:gap-[5px] xl:gap-[10px] 2xl:gap-[15px] w-full h-full`}
            >
              <p className="hero text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-6xl font-light invisible">
                WHERE,
              </p>
              <p className="hero text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-4xl font-extralight invisible">
                talent Meets Opportunity
              </p>
              <p className="hero-gradient text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-4xl bg-gradient-to-t from-blue-900 via-blue-400 to-blue-100 bg-clip-text text-transparent font-normal invisible">
                -Intelligently
              </p>
              <p className="description text-xs md:text-sm lg:sm xl:text-md 2xl:text-lg font-extralight text-neutral-300 invisible">
                "Evalia connects recruiters and candidates through AI-powered
                interviews, automated evaluations, and personalized upskilling tools."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
