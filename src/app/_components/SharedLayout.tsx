import React from "react"

interface SharedLayoutProps {
  title?: string
  children: React.ReactNode
}

const SharedLayout = ({ title, children }: SharedLayoutProps) => {
  return (
    <div className="p-4 flex flex-col justify-center">
      <div className="flex justify-center">
        {/* <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">{title}</h1> */}
        <img src="/logo/essentials_logo.png" alt="Essentials Studio Logo" className="w-[300px] items-center justify-center md:hidden" />
      </div>
      <div>{children}</div>
    </div>
  )
}

export default SharedLayout 