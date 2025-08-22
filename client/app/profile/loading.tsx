import { ScaleLoader } from 'react-spinners'

const loading = () => {
  return (
    <div className='w-full h-full flex justify-center items-center '>
      <ScaleLoader barCount={4} color='white'/>
    </div>
  )
}

export default loading
