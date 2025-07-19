import CourseSection from "@/components/home/CourseSection"
import CourseSectionHero from "@/components/home/CourseSectionHero"
import HeroSection from "@/components/home/HeroSection"
import InterviewSectionHero from "@/components/home/InterviewSectionHero"
import InterviewShowcase from "@/components/home/InterviewShowcase"
import QuoteSection from "@/components/home/QuoteSection"
import ServiceSection from "@/components/home/ServiceSection"

const HomePage = () => {
  return (
    <div className="w-full h-full overflow-y-scroll flex flex-col scroll-container">
      <HeroSection/>
      <ServiceSection/>
      <InterviewSectionHero/>
      <InterviewShowcase/>
      <QuoteSection/>
      <CourseSectionHero/>
      <CourseSection/>
    </div>
  )
}

export default HomePage
