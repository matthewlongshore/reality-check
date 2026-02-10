"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Info } from "lucide-react"
import { ResultCard, type RiskLevel, type CategoryBreakdown } from "@/components/result-card"
import { LoadingIndicator } from "@/components/loading-indicator"
import { ExamplePills } from "@/components/example-pills"
import { InfoModal } from "@/components/info-modal"

// Predictive equation coefficients (OLS regression, R² = 0.302, all p < 0.001)
const INTERCEPT = 1.565
const COEF_LOG_TOPIC = -0.122
const COEF_IS_NANO = 0.468
const COEF_LOG_COUNTRY = -0.123

// For 95% mean confidence interval calculation
const MSE = 0.17500454853047462
const XTX_INV = [
  [0.1241653961269146, -0.0004086947610075407, -0.0013720023406530145, -0.01974929210738879],
  [-0.00040869476100748264, 0.0008501341725356133, 3.4169994771720727e-07, -0.0005459884720810814],
  [-0.0013720023406530151, 3.4169994771749537e-07, 0.0027874927965916914, -3.003079533087211e-06],
  [-0.019749292107388836, -0.000545988472081072, -3.003079533087108e-06, 0.003617671144858614],
]

// Category-level regression coefficients (intercept, logTopic, isNano, logCountry)
const CAT_COEFS = {
  verified:          { intercept: -0.8376, logTopic: 0.1055, isNano: -0.3369, logCountry: 0.1337 },
  verifiedWithError: { intercept: 0.2751,  logTopic: 0.0162, isNano: -0.1393, logCountry: -0.0119 },
  needsReview:       { intercept: 0.3796,  logTopic: -0.0106, isNano: 0.0237, logCountry: -0.0242 },
  unverified:        { intercept: 1.1854,  logTopic: -0.1109, isNano: 0.4441, logCountry: -0.0984 },
}

function predict(topicCount: number, countryTotal: number, isNano: boolean): number {
  const tc = Math.max(topicCount, 1)
  const cc = Math.max(countryTotal, 1)
  const rate =
    INTERCEPT +
    COEF_LOG_TOPIC * Math.log10(tc) +
    COEF_IS_NANO * (isNano ? 1 : 0) +
    COEF_LOG_COUNTRY * Math.log10(cc)
  return Math.max(0, Math.min(1, rate))
}

function predictCategories(topicCount: number, countryTotal: number, isNano: boolean): CategoryBreakdown {
  const lt = Math.log10(Math.max(topicCount, 1))
  const nano = isNano ? 1 : 0
  const lc = Math.log10(Math.max(countryTotal, 1))

  const raw: Record<string, number> = {}
  for (const [key, c] of Object.entries(CAT_COEFS)) {
    raw[key] = Math.max(0, c.intercept + c.logTopic * lt + c.isNano * nano + c.logCountry * lc)
  }

  const total = Object.values(raw).reduce((a, b) => a + b, 0)
  return {
    verified: (raw.verified / total) * 100,
    verifiedWithError: (raw.verifiedWithError / total) * 100,
    needsReview: (raw.needsReview / total) * 100,
    unverified: (raw.unverified / total) * 100,
  }
}

function confidenceMargin(topicCount: number, countryTotal: number, isNano: boolean): number {
  const x = [1, Math.log10(Math.max(topicCount, 1)), isNano ? 1 : 0, Math.log10(Math.max(countryTotal, 1))]
  let quadForm = 0
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      quadForm += x[i] * XTX_INV[i][j] * x[j]
    }
  }
  const seMean = Math.sqrt(MSE * quadForm)
  return 1.96 * seMean
}

function getRiskLevel(rate: number): RiskLevel {
  if (rate < 0.15) return "Low"
  if (rate < 0.30) return "Moderate"
  if (rate < 0.50) return "High"
  if (rate < 0.70) return "Very High"
  return "Severe"
}

function getAdvisory(risk: RiskLevel): string {
  switch (risk) {
    case "Low":
      return "Likely reliable — verify selectively"
    case "Moderate":
      return "Some errors expected — verify key references"
    case "High":
      return "Significant error risk — verify all references"
    case "Very High":
      return "Majority of references may contain errors"
    case "Severe":
      return "Most references likely unreliable — do not use without verification"
  }
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

async function fetchOpenAlex(query: string): Promise<number> {
  const encoded = encodeURIComponent(query)
  const url = `https://api.openalex.org/works?filter=default.search:${encoded}&per_page=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OpenAlex error: ${res.status}`)
  const data = await res.json()
  return data?.meta?.count ?? 0
}

interface ModelResult {
  rate: number
  margin: number
  categories: CategoryBreakdown
  riskLevel: RiskLevel
  advisory: string
}

interface PredictionResult {
  topicCount: number
  countryTotal: number
  flagship: ModelResult
  small: ModelResult
}

function buildResult(topicCount: number, countryTotal: number, isNano: boolean): ModelResult {
  const rate = predict(topicCount, countryTotal, isNano)
  const margin = confidenceMargin(topicCount, countryTotal, isNano)
  const categories = predictCategories(topicCount, countryTotal, isNano)
  const riskLevel = getRiskLevel(rate)
  return { rate, margin, categories, riskLevel, advisory: getAdvisory(riskLevel) }
}

export default function Home() {
  const [topic, setTopic] = useState("")
  const [country, setCountry] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState("")
  const [modalOpen, setModalOpen] = useState<"methodology" | "predictability" | "limitations" | null>(null)

  const runPrediction = useCallback((topicCount: number, countryTotal: number) => {
    setResult({
      topicCount,
      countryTotal,
      flagship: buildResult(topicCount, countryTotal, false),
      small: buildResult(topicCount, countryTotal, true),
    })
  }, [])

  const handlePredict = useCallback(async () => {
    if (!topic.trim() || !country.trim()) return
    setResult(null)
    setError("")
    setLoading(true)

    try {
      const [topicCount, countryTotal] = await Promise.all([
        fetchOpenAlex(`${topic.trim()} "${country.trim()}"`),
        fetchOpenAlex(`"${country.trim()}"`),
      ])
      runPrediction(topicCount, countryTotal)
    } catch {
      setError("Could not reach OpenAlex. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [topic, country, runPrediction])

  const handleExampleSelect = useCallback((exTopic: string, exCountry: string) => {
    setTopic(exTopic)
    setCountry(exCountry)
    setResult(null)
    setError("")
    setLoading(true)

    Promise.all([
      fetchOpenAlex(`${exTopic} "${exCountry}"`),
      fetchOpenAlex(`"${exCountry}"`),
    ])
      .then(([topicCount, countryTotal]) => runPrediction(topicCount, countryTotal))
      .catch(() => setError("Could not reach OpenAlex. Please try again."))
      .finally(() => setLoading(false))
  }, [runPrediction])

  return (
    <div className="relative flex min-h-screen flex-col">
      <InfoModal open={modalOpen} onClose={() => setModalOpen(null)} />

      {/* Subtle noise/grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle radial glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_70%)]" />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 lg:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <h1 className="mb-3 text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Research Reality Check
          </h1>
          <p className="text-muted-foreground">
            Predict AI academic reference hallucination (error) rates for any research topic and country.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <button
              onClick={() => setModalOpen("methodology")}
              className="inline-flex cursor-pointer items-center gap-1 text-xs text-emerald-400/60 transition-colors hover:text-emerald-300"
            >
              <Info className="h-3 w-3" />
              <span className="underline underline-offset-2">What does this mean?</span>
            </button>
            <button
              onClick={() => setModalOpen("predictability")}
              className="inline-flex cursor-pointer items-center gap-1 text-xs text-blue-400/60 transition-colors hover:text-blue-300"
            >
              <Info className="h-3 w-3" />
              <span className="underline underline-offset-2">Is this really predictable?</span>
            </button>
            <button
              onClick={() => setModalOpen("limitations")}
              className="inline-flex cursor-pointer items-center gap-1 text-xs text-amber-400/60 transition-colors hover:text-amber-300"
            >
              <Info className="h-3 w-3" />
              <span className="underline underline-offset-2">Is this always correct?</span>
            </button>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10 w-full"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Research topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePredict()}
                className="w-full rounded-lg border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground/60 outline-none transition-all duration-300 focus:border-muted-foreground/30 focus:shadow-[0_0_20px_rgba(255,255,255,0.04)]"
              />
            </div>
            <div className="relative sm:w-48">
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePredict()}
                className="w-full rounded-lg border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground/60 outline-none transition-all duration-300 focus:border-muted-foreground/30 focus:shadow-[0_0_20px_rgba(255,255,255,0.04)]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handlePredict}
            disabled={!topic.trim() || !country.trim() || loading}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-all duration-200 hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Search className="h-4 w-4" />
            Predict
          </button>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <LoadingIndicator />
            </motion.div>
          )}

          {result && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-10 w-full"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="mb-4 text-center text-xs text-muted-foreground/60"
              >
                OpenAlex: {formatCount(result.topicCount)} topic+country works · {formatCount(result.countryTotal)} country works
              </motion.p>

              <div className="flex w-full flex-col gap-4 lg:flex-row">
                <ResultCard
                  modelLabel="Flagship Model"
                  modelDescription="e.g. GPT-5, Claude Opus, Gemini Pro"
                  hallucinationRate={Math.round(result.flagship.rate * 100)}
                  margin={Math.round(result.flagship.margin * 100)}
                  categories={result.flagship.categories}
                  riskLevel={result.flagship.riskLevel}
                  advisory={result.flagship.advisory}
                  delay={0.1}
                />
                <ResultCard
                  modelLabel="Small Model"
                  modelDescription="e.g. GPT-5-nano, Haiku, Llama 3 8B"
                  hallucinationRate={Math.round(result.small.rate * 100)}
                  margin={Math.round(result.small.margin * 100)}
                  categories={result.small.categories}
                  riskLevel={result.small.riskLevel}
                  advisory={result.small.advisory}
                  delay={0.3}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full"
        >
          <p className="mb-3 text-center text-xs text-muted-foreground/60 uppercase tracking-widest">
            Try an example
          </p>
          <ExamplePills onSelect={handleExampleSelect} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-xs text-muted-foreground/40">
            Have references to check, but don&apos;t have a lot of time?{" "}
            <a
              href="https://sourceverify.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/60 underline underline-offset-2 transition-colors hover:text-foreground"
            >
              SourceVerify.ai
            </a>
          </p>
          <p className="mt-1 text-[10px] italic text-muted-foreground/30">
            Trust Every Reference
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative z-10 border-t border-border px-6 py-6"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground/60">
            Based on{" "}
            <span className="font-mono text-muted-foreground">1,435</span>{" "}
            verified citations &middot; R&sup2; = 0.302
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://openalex.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              Powered by OpenAlex
            </a>
            <span className="text-muted-foreground/20">|</span>
            <a
              href="https://sourceverify.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              SourceVerify.ai
            </a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
