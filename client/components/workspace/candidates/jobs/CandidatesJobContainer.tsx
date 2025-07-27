import CandidatesJobCard from "./CandidatesJobCard"

const CandidatesJobContainer = () => {
  return (
      <div className="w-full h-full flex flex-wrap overflow-y-scroll scroll-container justify-center pt-[30px] gap-x-[10px] gap-y-[10px] content-start">
        <CandidatesJobCard/>
        <CandidatesJobCard/>
        <CandidatesJobCard/>
        <CandidatesJobCard/>
        <CandidatesJobCard/>
        <CandidatesJobCard/>
      </div>
  )
}

export default CandidatesJobContainer
