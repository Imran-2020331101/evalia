'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/all';
import { Major_Mono_Display } from 'next/font/google';
import Link from 'next/link';
import { useAppDispatch } from '@/redux/lib/hooks';
import { toggleIsShowHamburgerMenu } from '@/redux/features/utils';

const majorMono = Major_Mono_Display({ weight: '400', subsets: ['latin'] });

gsap.registerPlugin(SplitText);

const NavBar = () => {

  const dispatch = useAppDispatch()

  useGSAP(() => {
    const startAnimation = () => {
      const navSplit = new SplitText('.navSplit', { type: 'lines' });


      gsap.set('.navSplit', { visibility: 'visible' });
      gsap.set('.hamburger-line', { visibility: 'visible' });

      gsap.from(navSplit.lines, {
        opacity: 0,
        yPercent: -100,
        duration: 1.8,
        ease: 'expo.out',
        stagger: 0.03,
      });

      gsap.from('.line-divider', {
        scaleY: 0,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
      });

      gsap.from('.hamburger-line', {
        yPercent: -100,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
      });
    };
 
    if (document.fonts.status === 'loaded') {
      startAnimation();
    } else {
      document.fonts.ready.then(startAnimation);
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[90px] pb-[10px] flex justify-between px-[20px] z-50 backdrop-blur-sm">
      <div className="w-[20%] h-full flex justify-start items-end pl-[30px]">
        <p
          className={`uppercase text-3xl ${majorMono.className} navSplit`}
          style={{ visibility: 'hidden' }} 
        >
          Evalia
        </p>
        <div className="ml-[30px] mb-[5px] h-[20px] w-[1px] bg-neutral-100 line-divider"></div>
      </div>
      <div className="w-[30%] h-full flex justify-center items-end gap-[25px] text-neutral-300">
        <Link
          href="/"
          className="text-xl font-sans tracking-wider font-extralight hover:text-white cursor-pointer navSplit"
          style={{ visibility: 'hidden' }}
        >
          Home
        </Link>
        <Link
          href="/auth/register"
          className="text-xl font-sans tracking-wider font-extralight hover:text-white cursor-pointer navSplit"
          style={{ visibility: 'hidden' }}
        >
          Courses
        </Link>
        <p
          className="text-xl font-sans tracking-wider font-extralight hover:text-white cursor-pointer navSplit"
          style={{ visibility: 'hidden' }}
        >
          Services
        </p>
      </div>
      <div className="w-[20%] h-full flex justify-end items-end pr-[30px]">
        <button onClick={()=>dispatch(toggleIsShowHamburgerMenu())} style={{ visibility: 'hidden' }} className="flex w-[80px] h-[15px] flex-col justify-between group cursor-pointer hamburger-line">
          <div className="w-[80%] h-[3px] bg-white self-start group-hover:translate-x-[8px]  transition-transform duration-500"></div>
          <div className="w-[80%] h-[3px] bg-white self-end group-hover:translate-x-[-8px] transition-transform duration-500"></div>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
