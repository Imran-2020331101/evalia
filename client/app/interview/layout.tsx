import Image from "next/image";
import { Major_Mono_Display } from "next/font/google";
import X from '../../public/x-solid.svg'
import Link from "next/link";


const majorMono = Major_Mono_Display({ weight: '400', subsets: ['latin'] });

const interviewLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="fixed bottom-0 top-0 right-0 left-0 z-[60] bg-neutral-950 ">
      <div className="w-full h-full flex justify-center items-center bg-gray-950/90 relative">
        <Link href={'/'}
          className={`uppercase text-3xl ${majorMono.className} absolute top-8 left-4 text-white `}
        >
          Evalia
        </Link>
        <button className="absolute right-0 top-0 p-4 ">
          <Image alt="x mark" src={X} className="w-[25px] h-auto"/>
        </button>
        <div className="w-[65%] h-[80%] ">{children}</div>
      </div>
    </div>
  )
}

export default interviewLayout
