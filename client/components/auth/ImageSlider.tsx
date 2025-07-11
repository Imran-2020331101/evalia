'use client'

import { useEffect, useState } from "react"
import imagesArray from "@/Data/slider"
import Image from "next/image"

const ImageSlider = () => {
    const [translate, setTranslate]=useState(0);
    const [dir, setDir] = useState(false);
    useEffect(()=>{
        const intervalId = setInterval(() => {
            setTranslate((prev) => {
              if (prev === 0 && !dir) {
                setDir(true);
                return prev;
              } else if (prev === 3 && dir) {
                setDir(false);
                return 2;
              } else {
                return dir ? prev + 1 : prev - 1;
              }
            });
          }, 10000);
        return ()=>clearInterval(intervalId);
    },[dir])
  return (
    <div className='w-full h-full bg-[#352121]/30 px-[10px] py-[10px] relative'>
        <div className="absolute top-0 left-0 w-[50px] h-[50px] border-t-[1px] border-l-[1px] border-[#ac8e8e]"></div>
        <div className="absolute bottom-0 left-0 w-[50px] h-[50px] border-b-[1px] border-l-[1px] border-[#ac8e8e]"></div>
      <div className="w-full h-full flex overflow-hidden">
        {
            imagesArray.map((item)=>
                <div key={item.id} style={{transform: `translateX(-${100*translate}%)`}} className={`w-full h-full shrink-0 transition-transform duration-700`}>
                    <Image height={800} width={800} alt=""  src={item.url} className="w-full h-full object-cover"/> 
                </div>
            )
        }
      </div>
    </div>
  )
}

export default ImageSlider
