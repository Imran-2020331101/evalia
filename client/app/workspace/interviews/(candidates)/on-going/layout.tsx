
const interviewOngoingLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
      <div className="w-full h-full flex justify-center items-center bg-gray-950/90 relative">
        <div className="w-[65%] h-[80%] ">{children}</div>
      </div>
  )
}

export default interviewOngoingLayout
