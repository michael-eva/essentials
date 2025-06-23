import React from "react"

interface SharedLayoutProps {
  title?: string
  children: React.ReactNode
}

const SharedLayout = ({ title, children }: SharedLayoutProps) => {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">{title}</h1>
      <div>{children}</div>
    </div>
  )
}

export default SharedLayout 