"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { ChevronRight, CheckCircle } from "lucide-react"

interface FormSectionProps {
  title: string
  description: string
  icon: ReactNode
  completion: number
  onClick: () => void
  data: Record<string, string>
  color: string
  isComplete: boolean
  isHighlighted: boolean
}

export default function FormSection({
  title,
  description,
  icon,
  completion,
  onClick,
  data,
  color,
  isComplete,
  isHighlighted,
}: FormSectionProps) {

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      animate={
        isHighlighted
          ? {
            scale: [1, 1.02, 1],
            boxShadow: ["0 0 0 rgba(0, 0, 0, 0)", "0 4px 20px rgba(0, 0, 0, 0.1)", "0 0 0 rgba(0, 0, 0, 0)"],
          }
          : {}
      }
      transition={{ duration: 0.4 }}
      className="shadow-lg"
    >
      <div
        className={`bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-all duration-300 ${isComplete ? "ring-1 ring-gray-200" : ""
          }`}
        onClick={onClick}
        style={{
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="p-2.5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <div className="text-[color]" style={{ color }}>
                  {icon}
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-900">{title}</h3>
                  {isComplete && <CheckCircle className="h-4 w-4 ml-1.5" style={{ color }} />}
                </div>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-gray-300" />
          </div>

          <div className="mt-3 space-y-2.5">
            <div className="flex items-center space-x-2">
              <div className="h-1 flex-grow bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-medium text-gray-500">{completion}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
