"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

interface SuccessToastProps {
  message: string
}

export default function SuccessToast({ message }: SuccessToastProps) {
  return (
    <motion.div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-full shadow-lg py-2.5 px-4 flex items-center space-x-2 backdrop-blur-sm bg-opacity-90 border border-gray-100">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="text-sm font-medium text-gray-900">{message}</span>
      </div>
    </motion.div>
  )
}
