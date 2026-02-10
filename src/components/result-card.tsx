"use client"

import { motion } from "framer-motion"
import { AnimatedNumber } from "./animated-number"

export type RiskLevel = "Low" | "Moderate" | "High" | "Very High" | "Severe"

export interface CategoryBreakdown {
  verified: number
  verifiedWithError: number
  needsReview: number
  unverified: number
}

interface ResultCardProps {
  modelLabel: string
  modelDescription: string
  hallucinationRate: number
  margin: number
  categories: CategoryBreakdown
  riskLevel: RiskLevel
  advisory: string
  delay?: number
}

function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "Low":
      return "text-emerald-400"
    case "Moderate":
      return "text-yellow-400"
    case "High":
      return "text-orange-400"
    case "Very High":
      return "text-red-400"
    case "Severe":
      return "text-red-500"
  }
}

function getRiskGlow(level: RiskLevel): string {
  switch (level) {
    case "Low":
      return "shadow-emerald-500/10"
    case "Moderate":
      return "shadow-yellow-500/10"
    case "High":
      return "shadow-orange-500/10"
    case "Very High":
      return "shadow-red-500/10"
    case "Severe":
      return "shadow-red-500/15"
  }
}

function getRiskBorder(level: RiskLevel): string {
  switch (level) {
    case "Low":
      return "border-emerald-500/20"
    case "Moderate":
      return "border-yellow-500/20"
    case "High":
      return "border-orange-500/20"
    case "Very High":
      return "border-red-500/20"
    case "Severe":
      return "border-red-500/25"
  }
}

const CAT_COLORS = {
  verified: "bg-emerald-500",
  verifiedWithError: "bg-zinc-500",
  needsReview: "bg-amber-500",
  unverified: "bg-rose-500",
}

export function ResultCard({
  modelLabel,
  modelDescription,
  hallucinationRate,
  margin,
  categories,
  riskLevel,
  advisory,
  delay = 0,
}: ResultCardProps) {
  const capped = hallucinationRate > 90

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`flex flex-1 flex-col rounded-xl border bg-card p-6 shadow-lg lg:p-8 ${getRiskGlow(riskLevel)} ${getRiskBorder(riskLevel)}`}
    >
      <div className="mb-6">
        <h3 className="text-sm font-medium tracking-wide text-foreground/90 uppercase">
          {modelLabel}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{modelDescription}</p>
      </div>

      <div className="mb-6 flex flex-col items-center py-4">
        <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Predicted Error Rate
        </p>
        {capped ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.3 }}
            className="font-mono text-5xl font-bold tracking-tight text-foreground lg:text-6xl"
          >
            &gt;90%
          </motion.span>
        ) : (
          <AnimatedNumber
            value={hallucinationRate}
            delay={delay + 0.3}
            className="font-mono text-5xl font-bold tracking-tight text-foreground lg:text-6xl"
          />
        )}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: delay + 1.2 }}
          className="mt-1 text-xs text-muted-foreground/50 font-mono"
        >
          {capped ? "ceiling effect" : `±${margin} pp`}
        </motion.p>
      </div>

      {/* Category breakdown bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5, delay: delay + 1.0 }}
        className="mb-2 origin-left"
      >
        <div className="flex h-2 w-full overflow-hidden rounded-full">
          <div className={`${CAT_COLORS.verified}`} style={{ width: `${categories.verified}%` }} />
          <div className={`${CAT_COLORS.verifiedWithError}`} style={{ width: `${categories.verifiedWithError}%` }} />
          <div className={`${CAT_COLORS.needsReview}`} style={{ width: `${categories.needsReview}%` }} />
          <div className={`${CAT_COLORS.unverified}`} style={{ width: `${categories.unverified}%` }} />
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: delay + 1.3 }}
        className="mb-6 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-muted-foreground/70"
      >
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${CAT_COLORS.verified}`} />
          Verified {Math.round(categories.verified)}%
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${CAT_COLORS.verifiedWithError}`} />
          Verified w/ error {Math.round(categories.verifiedWithError)}%
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${CAT_COLORS.needsReview}`} />
          Needs review {Math.round(categories.needsReview)}%
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${CAT_COLORS.unverified}`} />
          Unverified {Math.round(categories.unverified)}%
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: delay + 1.6 }}
        >
          <span
            className={`inline-block rounded-full border border-current/20 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase ${getRiskColor(riskLevel)}`}
          >
            {riskLevel} Risk
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 1.9 }}
          className="text-center text-sm leading-relaxed text-muted-foreground"
        >
          {advisory}
        </motion.p>
      </div>
    </motion.div>
  )
}
