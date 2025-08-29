'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import MyJobSingleNavbar from '@/components/workspace/recruiters/jobs/my-jobs/MyJobSingleNavbar'
import MyJobsSingle from '@/components/workspace/recruiters/jobs/my-jobs/MyJobsSingle'
import { Didact_Gothic } from 'next/font/google'
import { useParams } from 'next/navigation'
import { ScaleLoader } from 'react-spinners'

const didact_gothic = Didact_Gothic({ weight: ['400'], subsets: ['latin'] })

interface RecruitersSingleJobLayoutProps {
  children: React.ReactNode
  params: {
    id: string
  }
}


const RecruitersSingleJobLayout = ({ children}: RecruitersSingleJobLayoutProps) => {
  const {id} = useParams()

  const [job, setJob]=useState<any>(null);

  useEffect(()=>{
      const  handleFetchJobById = async ()=>{
        console.log('fetching single job..')
          try {
              const response = await axios.get(`http://localhost:8080/api/job/${id}`, {withCredentials:true})
              setJob(response.data.data)
              console.log(response.data, 'fetch single job')
          } catch (err:any) {
              console.log(err, 'error')
          }
      }
      handleFetchJobById()
  },[id])
  if(!job) return <div className="w-full h-full flex items-center justify-center ">
            <ScaleLoader height={25} barCount={4} color="white"/>
        </div>
  return (
    <div className={`w-full h-full p-[10px] gap-[20px] ${didact_gothic.className} tracking-wider`}>
      <div className="w-full h-full flex items-center bg-slate-900/40 ">
        <div className="w-[60%] h-full shrink-0">
          <MyJobsSingle job={job} />
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
