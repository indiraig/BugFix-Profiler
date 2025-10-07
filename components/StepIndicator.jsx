"use client";
import { motion } from "framer-motion";

export default function StepIndicator({ step, label, active }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center space-x-3 p-4 rounded-lg w-72 ${
        active ? "bg-blue-100" : "bg-gray-100"
      }`}
    >
      <span
        className={`w-6 h-6 flex items-center justify-center rounded-full font-bold ${
          active ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"
        }`}
      >
        {step}
      </span>
      <span className="text-gray-700">{label}</span>
    </motion.div>
  );
}
