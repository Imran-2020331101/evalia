
const interviewLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-[65%] h-[80%]">{children}</div>
    </div>
  )
}

export default interviewLayout
