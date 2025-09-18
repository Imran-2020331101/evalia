'use client'

import { isShowHamburgerMenu, toggleIsShowHamburgerMenu } from '@/redux/features/utils'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { Dot, X } from 'lucide-react'
import {Comfortaa , Michroma} from 'next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/all'
import { fetchUserData, isSignedIn, setIsSingedIn, user } from '@/redux/features/auth'
import { useEffect, useState } from 'react'
import { useProgressRouter } from '@/custom-hooks/useProgressRouter'

gsap.registerPlugin(SplitText)

const kronaOne =Comfortaa({
  weight: ['300','400','500','600','700'],
  subsets: ['latin'],
});

const michroma = Michroma({
  weight:["400"],
  subsets:["latin"]
})

const HamburgerMenu = () => {
  const [isMounted, setIsMounted]=useState(false);
  const currentIsShowHamburgerMenu = useAppSelector(isShowHamburgerMenu)
  const currentIsSignedIn = useAppSelector(isSignedIn);
  const currentUser = useAppSelector(user);

  const dispatch = useAppDispatch()
  const router  = useProgressRouter()

  const handleNavToWorkspace = ()=>{
    dispatch(toggleIsShowHamburgerMenu());
    router.push('/workspace');
  }

  const handleNavToProfile = ()=>{
    dispatch(toggleIsShowHamburgerMenu());
    router.push('/profile');
  }

  const handleNavToRegister = ()=>{
    dispatch(toggleIsShowHamburgerMenu());
    router.push('/auth/register');
  }
  const handleNavToLogin = ()=>{
    dispatch(toggleIsShowHamburgerMenu());
    router.push('/auth/login');
  }


  useGSAP(() => {
  if (!currentIsShowHamburgerMenu) return;

  requestAnimationFrame(() => {
    const hero = document.querySelector('#hero');
    const profile = document.querySelector('#profile');
    const workspace = document.querySelector('#workspace');
    const gradient = document.querySelector('#gradient');

    if (!hero || !profile || !workspace || !gradient) return;

    const heroSplit = new SplitText('#hero',{type:'lines'})

    const ctx = gsap.context(() => {
      gsap.set([hero, profile, workspace, gradient], { visibility: 'hidden' });

      gsap.fromTo(
        [gradient],
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: 'power1.out', onStart: () => {
          gsap.set([hero, profile, workspace, gradient], { visibility: 'visible' });
        }}
      );

      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' }
      });

      tl.fromTo(heroSplit.lines, { xPercent: 20 , opacity:0}, { xPercent: 0, duration: 1.2, opacity:1, stagger:0.1 },)
        .fromTo(profile, { xPercent: -30, opacity:0 }, { opacity:1, xPercent: 0, duration: 1.5 }, '-=0.8')
        .fromTo(workspace, { xPercent: -30, opacity:0 }, { opacity:1, xPercent: 0, duration: 1.5 }, '-=1.4');
    });

    return () => ctx.revert();
  });
}, [currentIsShowHamburgerMenu]);

useEffect(()=>{
  if(!currentUser)dispatch(fetchUserData());
  dispatch(setIsSingedIn(JSON.parse(localStorage.getItem('isSignedIn')??"false")));
  setIsMounted(true);
},[])

  return (
    <div className={`${currentIsShowHamburgerMenu?'fixed':'hidden'} z-[60] top-[90px] bottom-0 left-0 right-0  px-[50px] pb-[50px]`}>
      <div className="w-full h-full relative flex bg-gray-950/90 flex-col rounded-b-4xl rounded-tl-4xl">
        <div id='gradient' className="w-full h-1/2 bg-gradient-to-bl from-slate-800 via-transparent to-transparent rounded-tl-4xl"></div>
        <div id='gradient' className="w-full h-1/2 bg-gradient-to-tr from-slate-800 via-transparent to-transparent rounded-b-4xl"></div>

        <div className="w-[100px] h-[70px] bg-slate-800 flex absolute rounded-t-4xl top-[-69px] right-0 z-10">
          <div className="bg-gray-900/30 w-full h-full flex justify-center items-center rounded-t-4xl border-t-[1px] border-x-[1px] border-slate-800">
              <button onClick={()=>dispatch(toggleIsShowHamburgerMenu())} className='cursor-pointer'>
                <X  size={50} strokeWidth={1} className='text-gray-200 hover:text-white'/>
              </button>
          </div>
        </div>
        <div className="w-full flex h-full absolute left-0 top-0 backdrop-blur-2xl rounded-b-4xl rounded-tl-4xl border border-gray-800">
            <div className="w-1/2 h-full flex flex-col justify-end pb-[7%] xl:[8%] 2xl:pb-[10%] pl-[7%]  2xl:pl-[10%] gap-2">
              <p 
                id='hero'
                className={`
                  ${kronaOne.className}
                  text-md sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl
                  leading-[38px] sm:leading-[44px] md:leading-[50px] lg:leading-[56px] xl:leading-[60px]
                  text-gray-200 
                `}
              >
                <span className='font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-6xl 2xl:text-7xl'>
                  A{' '}
                  <span className='inline-block bg-gradient-to-t from-blue-900 via-blue-300 to-blue-100 bg-clip-text text-transparent'>
                    platform
                  </span>
                </span>
                <br />
                – "Designed{' '}
                <span className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-5xl font-bold'>
                  for
                </span>{' '}
                Excellence <br />
                Built for Progress!"
              </p>

            </div>
            {
              !isMounted?null: currentUser?
                <div className="w-1/2 h-full flex justify-end items-start pt-[14%] pr-[10%]  tracking-widest ">
                    <div className={` ${michroma.className}  w-auto h-auto flex flex-col justify-center items-start  `}>
                      <div id='profile' className="flex items-center gap-4 group leading-none">
                        <Dot size={54} className='group-hover:text-blue-500 transition-colors duration-500' />
                        <button onClick={handleNavToProfile} className="text-2xl cursor-pointer ">Profile</button>
                      </div>
                      <div id='workspace' className="flex items-center gap-4 group leading-none">
                        <Dot size={54} className='group-hover:text-blue-500 transition-colors duration-500' />
                        <button onClick={handleNavToWorkspace} className="text-2xl cursor-pointer">Workspace</button>
                      </div>
                  </div>
                </div>
              : 
                <div className="w-1/2 h-full flex justify-end items-start pt-[14%] pr-[10%]  tracking-widest ">
                    <div className={` ${michroma.className}  w-auto h-auto flex flex-col justify-center items-start  `}>
                      <div id='workspace' className="flex items-center gap-4 group leading-none">
                        <Dot size={54} className='group-hover:text-blue-500 transition-colors duration-500' />
                        <button onClick={handleNavToLogin} className="text-2xl cursor-pointer">SignIN</button>
                      </div>
                      <div id='profile' className="flex items-center gap-4 group leading-none">
                        <Dot size={54} className='group-hover:text-blue-500 transition-colors duration-500' />
                        <button onClick={handleNavToRegister} className="text-2xl cursor-pointer ">SignUP</button>
                      </div>
                  </div>
                </div>
            }

        </div>
      </div>
    </div>
  )
}

export default HamburgerMenu
