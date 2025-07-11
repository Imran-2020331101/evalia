import React from 'react'

const LoginLayout = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
  return (
        <>{children}</>
  )
}

export default LoginLayout
