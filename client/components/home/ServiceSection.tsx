import { services } from "@/Data/home"
import { Kodchasan } from "next/font/google"
import Image from "next/image";

const KodchasanFont = Kodchasan({
  weight: ['200', '300','400','500', '700'],
  subsets: ['latin'],
});

const ServiceSection = () => {
  return (
    <div className='w-full min-h-[80vh] bg-gray-950/90 shrink-0 flex flex-col justify-end items-end'>
        <div className="w-full h-[100px] flex justify-start items-center pl-[50px]">
          <p className={`${KodchasanFont.className} text-5xl`}>Services</p>
        </div>
        <div className="w-full h-auto flex flex-col border-t-[1px] border-gray-800">
          {
            services.map((item)=><div key={item.id} className="w-full h-[80px] relative border-b-[1px] border-gray-800 px-[50px] group flex items-center">
                <p className={`text-xl text-gray-500 group-hover:text-gray-400 transition-all group-hover:translate-x-12 duration-500 ${KodchasanFont.className}`}>{item.name}</p>
                <div className="absolute w-[500px] h-[280px] opacity-0 group-hover:opacity-100 transition-opacity right-[10%] duration-1000 z-10">
                  <div className="w-full h-full relative">
                    <Image width={400} height={300} alt={item.title} src={item.url} className="absolute w-full h-full z-20 object-cover"/>
                    <div className="absolute w-full h-full z-30 flex justify-start items-end ">
                       <p className={`${KodchasanFont.className} text-lg w-full h-[100px] flex justify-start items-end p-[20px] bg-gradient-to-tr from-indigo-600/30  via-black/10 to-black/10`}>{item.title}</p>
                    </div>
                  </div>
                </div>
            </div>)
          }
        </div>
    </div>
  )
}

export default ServiceSection
