import React from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";

type AnimatedFieldProps = {
  label: string;
  children: React.ReactNode;
  index: number;
};

export function AnimatedField({ label, children, index }: AnimatedFieldProps) {
  return (
    <motion.div
      key={label}
      className="space-y-2 mb-4"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Label htmlFor={label} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      {children}
    </motion.div>
  );
}

// // Optional utility function for convenience
// export function renderField(label: string, children: React.ReactNode, index: number) {
//   return (
//     <AnimatedField label={label} index={index}>
//       {children}
//     </AnimatedField>
//   );
// } 