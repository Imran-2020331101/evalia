
const interviewOngoingLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
      <div className="w-full h-full flex justify-center items-center bg-gray-950/30 relative">
        <div className="w-[80%] h-[90%] ">{children}</div>
      </div>
  )
}

export default interviewOngoingLayout
