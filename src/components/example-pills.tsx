"use client"

import { motion } from "framer-motion"

interface ExampleQuery {
  topic: string
  country: string
  riskHint: "low" | "moderate" | "high" | "severe"
}

const EXAMPLES: ExampleQuery[] = [
  { topic: "malaria prevention", country: "Nigeria", riskHint: "high" },
  { topic: "climate change adaptation", country: "Senegal", riskHint: "high" },
  { topic: "biometric voter registration", country: "Ghana", riskHint: "severe" },
  { topic: "machine learning", country: "United States", riskHint: "low" },
  { topic: "maternal health", country: "Rwanda", riskHint: "high" },
  { topic: "quantum computing", country: "Germany", riskHint: "moderate" },
]

function getHintColor(hint: ExampleQuery["riskHint"]): string {
  switch (hint) {
    case "low":
      return "hover:border-emerald-500/40 hover:shadow-emerald-500/10"
    case "moderate":
      return "hover:border-yellow-500/40 hover:shadow-yellow-500/10"
    case "high":
      return "hover:border-orange-500/40 hover:shadow-orange-500/10"
    case "severe":
      return "hover:border-red-500/40 hover:shadow-red-500/10"
  }
}

interface ExamplePillsProps {
  onSelect: (topic: string, country: string) => void
}

export function ExamplePills({ onSelect }: ExamplePillsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {EXAMPLES.map((example, i) => (
        <motion.button
          key={`${example.topic}-${example.country}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(example.topic, example.country)}
          className={`cursor-pointer rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-md transition-all duration-300 hover:bg-accent hover:text-foreground ${getHintColor(example.riskHint)}`}
        >
          {example.topic}
          <span className="mx-1.5 text-muted-foreground/40">+</span>
          {example.country}
        </motion.button>
      ))}
    </div>
  )
}
