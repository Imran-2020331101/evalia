import MyJobSingleNavbar from '@/components/workspace/recruiters/jobs/my-jobs/MyJobSingleNavbar'
import MyJobsSingle from '@/components/workspace/recruiters/jobs/my-jobs/MyJobsSingle'
import { Didact_Gothic } from 'next/font/google'

const didact_gothic = Didact_Gothic({ weight: ['400'], subsets: ['latin'] })

interface RecruitersSingleJobLayoutProps {
  children: React.ReactNode
  params: {
    id: string
  }
}

const RecruitersSingleJobLayout = ({ children, params }: RecruitersSingleJobLayoutProps) => {
  const { id } = params
  return (
    <div className={`w-full h-full p-[10px] gap-[20px] ${didact_gothic.className} tracking-wider`}>
      <div className="w-full h-full flex items-center bg-slate-900/40 ">
        <div className="w-[60%] h-full shrink-0">
          <MyJobsSingle jobId={id}/>
        </div>
        <div className="h-[75%] w-[1px] self-end mb-[3%] bg-gray-800 shrink-0"></div>
        <div className="w-[40%] h-full bg-slate-900/40 shrink-0">
          <div className="w-full h-[7%] backdrop-blur-2xl">
            <MyJobSingleNavbar/>
          </div>
          <div className="w-full h-[93%] backdrop-blur-2xl ">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecruitersSingleJobLayout
