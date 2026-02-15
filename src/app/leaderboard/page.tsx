"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Brain, Layers, Search, Globe, Info, X, FlaskConical, MapPin, ArrowUpDown } from "lucide-react"
import Link from "next/link"

// ── Model data (from verified experiments) ──────────────────────────

interface ModelScore {
  us: number | null
  nigeria: number | null
  ghana: number | null
}

interface ModelEntry {
  name: string
  params: string
  activeParams?: string
  provider: string
  date: string
  scores: ModelScore
  tags: string[]
  refs: { us: number; nigeria: number; ghana: number }
  pending?: boolean
}

const MODELS: ModelEntry[] = [
  // All models pending re-verification against production SVRIS (Feb 2026)
  {
    name: "GPT-5",
    params: "?",
    provider: "OpenAI",
    date: "Jan 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["CoT"],
    refs: { us: 240, nigeria: 240, ghana: 239 },
    pending: true,
  },
  {
    name: "GPT-5 Nano",
    params: "UNK",
    provider: "OpenAI",
    date: "Jan 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["CoT"],
    refs: { us: 237, nigeria: 233, ghana: 238 },
    pending: true,
  },
  {
    name: "Llama 3.1 405B",
    params: "405B",
    provider: "Meta",
    date: "Feb 2025",
    scores: { us: 0.790, nigeria: 0.336, ghana: null },
    tags: ["dense", "open"],
    refs: { us: 240, nigeria: 240, ghana: 0 },
  },
  {
    name: "Llama 3.3 70B",
    params: "70B",
    provider: "Meta",
    date: "Feb 2025",
    scores: { us: 0.338, nigeria: null, ghana: null },
    tags: ["dense", "open"],
    refs: { us: 237, nigeria: 240, ghana: 240 },
    pending: true,
  },
  {
    name: "Llama 3.1 8B",
    params: "8B",
    provider: "Meta",
    date: "Feb 2025",
    scores: { us: 0.210, nigeria: null, ghana: null },
    tags: ["dense", "open"],
    refs: { us: 238, nigeria: 240, ghana: 240 },
    pending: true,
  },
  {
    name: "Llama 4 Scout",
    params: "109B",
    activeParams: "17B",
    provider: "Meta",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["MoE", "open"],
    refs: { us: 240, nigeria: 240, ghana: 0 },
    pending: true,
  },
  {
    name: "Llama 4 Maverick",
    params: "400B",
    activeParams: "17B",
    provider: "Meta",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["MoE", "open"],
    refs: { us: 240, nigeria: 240, ghana: 0 },
    pending: true,
  },
  {
    name: "Mistral Large 2",
    params: "123B",
    provider: "Mistral",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["dense"],
    refs: { us: 240, nigeria: 240, ghana: 0 },
    pending: true,
  },
  {
    name: "Mistral Small 3.2",
    params: "24B",
    provider: "Mistral",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["dense", "open"],
    refs: { us: 240, nigeria: 240, ghana: 0 },
    pending: true,
  },
  {
    name: "Mistral Medium 3.1",
    params: "250B",
    provider: "Mistral",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["dense"],
    refs: { us: 240, nigeria: 240, ghana: 0 },
    pending: true,
  },
  {
    name: "GPT-OSS 120B",
    params: "120B",
    activeParams: "5.1B",
    provider: "Groq",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["MoE"],
    refs: { us: 240, nigeria: 240, ghana: 0 },
    pending: true,
  },
  {
    name: "DeepSeek R1",
    params: "671B",
    activeParams: "37B",
    provider: "DeepSeek",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["MoE", "CoT"],
    refs: { us: 239, nigeria: 234, ghana: 0 },
    pending: true,
  },
  {
    name: "ERNIE 4.5",
    params: "300B",
    activeParams: "47B",
    provider: "Baidu",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["MoE"],
    refs: { us: 239, nigeria: 240, ghana: 0 },
    pending: true,
  },
  {
    name: "Kimi K2",
    params: "1T",
    activeParams: "32B",
    provider: "Moonshot",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["MoE"],
    refs: { us: 229, nigeria: 239, ghana: 0 },
    pending: true,
  },
  {
    name: "Perplexity Sonar",
    params: "70B",
    provider: "Perplexity",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["search"],
    refs: { us: 218, nigeria: 234, ghana: 0 },
    pending: true,
  },
  {
    name: "Gemma 3 27B",
    params: "27B",
    provider: "Google",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["dense", "open"],
    refs: { us: 240, nigeria: 240, ghana: 0 },
    pending: true,
  },
  {
    name: "Gemini 3 Flash",
    params: "?",
    provider: "Google",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["CoT"],
    refs: { us: 232, nigeria: 232, ghana: 0 },
    pending: true,
  },
  {
    name: "Gemini 3 Pro",
    params: "?",
    provider: "Google",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["CoT"],
    refs: { us: 237, nigeria: 240, ghana: 0 },
    pending: true,
  },
  {
    name: "Grok 3 Mini",
    params: "?",
    provider: "xAI",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["CoT"],
    refs: { us: 240, nigeria: 240, ghana: 0 },
    pending: true,
  },
  {
    name: "Cohere Command R+",
    params: "104B",
    provider: "Cohere",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["dense"],
    refs: { us: 240, nigeria: 240, ghana: 0 },
    pending: true,
  },
  {
    name: "Qwen 3 32B",
    params: "32B",
    provider: "Alibaba",
    date: "Feb 2025",
    scores: { us: null, nigeria: null, ghana: null },
    tags: ["dense"],
    refs: { us: 240, nigeria: 231, ghana: 222 },
    pending: true,
  },
]

const TOPICS = [
  "Biometric voter registration",
  "Climate change",
  "Climate change adaptation in agriculture",
  "Climate-smart agriculture for smallholder farmers",
  "Democratic elections",
  "Digital financial services",
  "Economics",
  "Education",
  "Energy",
  "Environmental Science",
  "Girls education",
  "Health",
  "Infectious disease",
  "Insecticide-treated bed nets for malaria",
  "Malaria prevention",
  "Microfinance loan repayment",
  "Mini-grid electrification",
  "Mobile banking",
  "Political Science",
  "Renewable energy",
  "Rural electrification",
  "School dropout",
  "School dropout prevention programs in rural areas",
  "Voter turnout",
]

// ── Helpers ──────────────────────────────────────────────────────────

function qualityColor(q: number): string {
  if (q >= 0.70) return "#34d399"
  if (q >= 0.50) return "#a3e635"
  if (q >= 0.30) return "#fbbf24"
  return "#f87171"
}

function qualityBg(q: number): string {
  if (q >= 0.70) return "rgba(52,211,153,0.08)"
  if (q >= 0.50) return "rgba(163,230,53,0.06)"
  if (q >= 0.30) return "rgba(251,191,36,0.06)"
  return "rgba(248,113,113,0.06)"
}

const TAG_CONFIG: Record<string, { icon: typeof Brain; label: string; color: string; title: string }> = {
  CoT: {
    icon: Brain,
    label: "CoT",
    color: "text-violet-400 border-violet-400/30 bg-violet-400/10",
    title: "Chain-of-Thought reasoning model",
  },
  MoE: {
    icon: Layers,
    label: "MoE",
    color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
    title: "Mixture of Experts \u2014 only a fraction of parameters are active per token",
  },
  search: {
    icon: Search,
    label: "Search",
    color: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    title: "Search-augmented model with web retrieval",
  },
  open: {
    icon: Globe,
    label: "Open",
    color: "text-emerald-400/60 border-emerald-400/20 bg-emerald-400/5",
    title: "Open-weights model \u2014 trained on publicly available data only",
  },
  dense: {
    icon: Layers,
    label: "Dense",
    color: "text-zinc-400/60 border-zinc-400/20 bg-zinc-400/5",
    title: "Dense model \u2014 all parameters active per token",
  },
}

function Tag({ tag }: { tag: string }) {
  const config = TAG_CONFIG[tag]
  if (!config) return null
  const Icon = config.icon
  return (
    <span
      title={config.title}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.color}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </span>
  )
}

function QualityBar({ score, country }: { score: number | null; country: string }) {
  if (score === null) {
    return (
      <div className="flex items-center gap-2" title={`${country}: awaiting verification`}>
        <div className="h-2 w-16 rounded-full bg-white/5 sm:w-20" />
        <span className="w-10 text-right font-mono text-[11px] text-muted-foreground/30">&mdash;</span>
      </div>
    )
  }

  const pct = Math.max(score * 100, 1)
  const color = qualityColor(score)

  return (
    <div className="flex items-center gap-2" title={`${country}: ${score.toFixed(3)}`}>
      <div className="h-2 w-16 overflow-hidden rounded-full bg-white/5 sm:w-20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span
        className="w-10 text-right font-mono text-[11px] font-semibold"
        style={{ color }}
      >
        {score.toFixed(3)}
      </span>
    </div>
  )
}

// ── Info Panel Component ─────────────────────────────────────────────

function InfoPanel({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="mb-6 rounded-xl border border-border/50 bg-card/80 p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <button
                onClick={onClose}
                className="cursor-pointer text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Page ─────────────────────────────────────────────────────────────

type SortKey = "rank" | "params" | "us"

function parseParamsToNumber(params: string): number {
  const s = params.toLowerCase().trim()
  if (s === "?" || s === "unk") return 0
  if (s.endsWith("t")) return parseFloat(s) * 1000
  if (s.endsWith("b")) return parseFloat(s)
  return 0
}

export default function LeaderboardPage() {
  const [showQualityInfo, setShowQualityInfo] = useState(false)
  const [showMethodology, setShowMethodology] = useState(false)
  const [showCountries, setShowCountries] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("rank")
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (key === "rank") setSortKey("rank")
      else setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(key === "params") // params ascending by default, US descending
    }
  }

  const verifiedUnsorted = MODELS.filter((m) => !m.pending)
  const pending = MODELS.filter((m) => m.pending)

  const verified = [...verifiedUnsorted].sort((a, b) => {
    if (sortKey === "rank") return 0 // keep original order (by US score desc)
    if (sortKey === "params") {
      const ap = parseParamsToNumber(a.params)
      const bp = parseParamsToNumber(b.params)
      return sortAsc ? ap - bp : bp - ap
    }
    if (sortKey === "us") {
      const as_ = a.scores.us ?? -1
      const bs = b.scores.us ?? -1
      return sortAsc ? as_ - bs : bs - as_
    }
    return 0
  })

  const allModels = [...verified, ...pending]
  const totalRefs = MODELS.reduce(
    (sum, m) => sum + m.refs.us + m.refs.nigeria + m.refs.ghana,
    0
  )

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_70%)]" />

      {/* Top nav */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex items-center justify-center px-6 pt-4"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3.5 py-1.5 text-xs font-medium text-emerald-400/80 transition-all hover:bg-emerald-400/10 hover:text-emerald-300"
        >
          <Search className="h-3 w-3" />
          Hallucination Rate Calculator
        </Link>
      </motion.nav>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 lg:py-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              ScholarReferenceBench
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            How well can LLMs recall real scholarly references? Each model was asked to cite 10 papers
            for 24 research topics across 3 countries. Every reference was then verified for authenticity by{" "}
            <a href="https://sourceverify.ai" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
              SourceVerify.ai
            </a>.
          </p>

          {/* Info buttons */}
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => { setShowQualityInfo(!showQualityInfo); setShowMethodology(false); setShowCountries(false) }}
              className={`inline-flex cursor-pointer items-center gap-1 text-xs transition-colors ${
                showQualityInfo ? "text-blue-300" : "text-blue-400/60 hover:text-blue-300"
              }`}
            >
              <Info className="h-3 w-3" />
              <span className="underline underline-offset-2">What is the quality score?</span>
            </button>
            <button
              onClick={() => { setShowMethodology(!showMethodology); setShowQualityInfo(false); setShowCountries(false) }}
              className={`inline-flex cursor-pointer items-center gap-1 text-xs transition-colors ${
                showMethodology ? "text-emerald-300" : "text-emerald-400/60 hover:text-emerald-300"
              }`}
            >
              <FlaskConical className="h-3 w-3" />
              <span className="underline underline-offset-2">Methodology</span>
            </button>
            <button
              onClick={() => { setShowCountries(!showCountries); setShowQualityInfo(false); setShowMethodology(false) }}
              className={`inline-flex cursor-pointer items-center gap-1 text-xs transition-colors ${
                showCountries ? "text-amber-300" : "text-amber-400/60 hover:text-amber-300"
              }`}
            >
              <MapPin className="h-3 w-3" />
              <span className="underline underline-offset-2">Why these countries?</span>
            </button>
          </div>
        </motion.div>

        {/* Quality Score Info Panel */}
        <InfoPanel
          open={showQualityInfo}
          onClose={() => setShowQualityInfo(false)}
          title="Quality Score"
        >
          <p>
            Every reference generated by an LLM is checked against scholarly databases using{" "}
            <a href="https://sourceverify.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline underline-offset-2 hover:text-blue-300">
              SVRIS
            </a>{" "}
            (SourceVerify Reference Identity Standard), which verifies the title, authors, year,
            venue, and identifiers (DOI, URL) of each citation.
          </p>
          <p>Each reference receives one of four outcomes, weighted to produce a quality score:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mt-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span><span className="font-semibold text-foreground">Verified</span> = 1.0</span>
            </div>
            <div className="text-muted-foreground/60">Paper exists, all metadata correct</div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-zinc-500" />
              <span><span className="font-semibold text-foreground">Verified w/ error</span> = 0.67</span>
            </div>
            <div className="text-muted-foreground/60">Paper is real but has metadata issues (wrong year, incomplete authors)</div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              <span><span className="font-semibold text-foreground">Needs human review</span> = 0.33</span>
            </div>
            <div className="text-muted-foreground/60">Could not be confirmed or denied automatically</div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
              <span><span className="font-semibold text-foreground">Unverified</span> = 0.0</span>
            </div>
            <div className="text-muted-foreground/60">Likely fabricated &mdash; no matching publication found</div>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-2">
            A quality score of 1.0 means every reference is a real, correctly-cited paper.
            A score of 0.0 means every reference is fabricated.
          </p>
        </InfoPanel>

        {/* Methodology Info Panel */}
        <InfoPanel
          open={showMethodology}
          onClose={() => setShowMethodology(false)}
          title="Methodology"
        >
          <p>
            Each model receives the same prompt: <em>&ldquo;List 10 relevant scholarly references (journal papers,
            conference papers, technical reports, or dissertations) about [topic] in [country].&rdquo;</em> with
            instructions to provide only the list, no commentary.
          </p>
          <p>
            We test <strong>24 research topics</strong> spanning 6 thematic groups &mdash; ranging from broad fields
            (Economics, Health) to highly specific interventions (Insecticide-treated bed nets for malaria,
            School dropout prevention programs in rural areas). Topics are tested across <strong>3 countries</strong>:
            United States, Nigeria, and Ghana.
          </p>
          <div className="mt-2">
            <p className="text-xs font-medium text-foreground mb-1.5">The 24 topics:</p>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map((t) => (
                <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground/70">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2">
            This yields <strong>24 topics &times; 10 references = 240 references</strong> per model per country.
            Every single reference is then verified by{" "}
            <a href="https://sourceverify.ai" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
              SourceVerify.ai
            </a>{" "}
            and given a quality score.
          </p>
        </InfoPanel>

        {/* Countries Info Panel */}
        <InfoPanel
          open={showCountries}
          onClose={() => setShowCountries(false)}
          title="Why United States, Nigeria, and Ghana?"
        >
          <p>
            These three countries represent vastly different levels of scholarly representation
            in global databases. Using{" "}
            <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline underline-offset-2 hover:text-amber-300">
              OpenAlex
            </a>{" "}
            (the largest open index of scholarly works), we can quantify the gap:
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs mt-2">
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span className="font-semibold text-foreground">United States</span>
              </div>
              <div className="font-mono text-lg text-blue-400">~80M</div>
              <div className="text-muted-foreground/50">works in OpenAlex</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                <span className="font-semibold text-foreground">Nigeria</span>
              </div>
              <div className="font-mono text-lg text-green-400">~700K</div>
              <div className="text-muted-foreground/50">works in OpenAlex</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-400" />
                <span className="font-semibold text-foreground">Ghana</span>
              </div>
              <div className="font-mono text-lg text-yellow-400">~100K</div>
              <div className="text-muted-foreground/50">works in OpenAlex</div>
            </div>
          </div>
          <p className="mt-2">
            This <strong>100&times; difference</strong> in scholarly output between the US and Nigeria
            directly affects how much training data LLMs have seen about each country. Since LLMs learn from text
            corpora that reflect these same imbalances, models that perform well on US topics may fail
            completely on Nigerian or Ghanaian ones &mdash; not because the task is harder, but because
            the training data is sparse.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            This is the core insight of our study: hallucination rates are predictable from the intersection
            of model capacity and training data representation.
          </p>
        </InfoPanel>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6 flex flex-wrap items-center gap-4"
        >
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              &ge; 0.70
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-lime-400" />
              0.50&ndash;0.69
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              0.30&ndash;0.49
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
              &lt; 0.30
            </span>
          </div>
          <span className="text-muted-foreground/20">|</span>
          <div className="flex items-center gap-2">
            {["CoT", "MoE", "search"].map((t) => (
              <Tag key={t} tag={t} />
            ))}
          </div>
        </motion.div>

        {/* ── Leaderboard Table ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-x-auto rounded-xl border border-border bg-card"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground/50">
                <th className="py-3 pl-4 pr-2 text-left font-semibold w-8">#</th>
                <th className="px-3 py-3 text-left font-semibold">Model</th>
                <th className="px-3 py-3 text-left font-semibold">
                  <button
                    onClick={() => handleSort("params")}
                    className={`inline-flex cursor-pointer items-center gap-1 transition-colors ${
                      sortKey === "params" ? "text-foreground/70" : "hover:text-foreground/50"
                    }`}
                  >
                    Params
                    <ArrowUpDown className="h-2.5 w-2.5" />
                  </button>
                </th>
                <th className="px-3 py-3 text-right font-semibold">
                  <button
                    onClick={() => handleSort("us")}
                    className={`inline-flex cursor-pointer items-center gap-1 transition-colors ${
                      sortKey === "us" ? "text-foreground/70" : "hover:text-foreground/50"
                    }`}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
                    United States
                    <ArrowUpDown className="h-2.5 w-2.5" />
                  </button>
                </th>
                <th className="px-3 py-3 text-right font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                    Nigeria
                  </span>
                </th>
                <th className="px-3 py-3 text-right font-semibold pr-4">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-400" />
                    Ghana
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {verified.map((model, i) => (
                <motion.tr
                  key={model.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="border-b border-border/50 transition-colors hover:bg-white/[0.02]"
                  style={{
                    background:
                      model.scores.us !== null
                        ? qualityBg(model.scores.us)
                        : undefined,
                  }}
                >
                  {/* Rank */}
                  <td className="py-3 pl-4 pr-2 text-center">
                    {i === 0 ? (
                      <span title="1st place">🥇</span>
                    ) : i === 1 ? (
                      <span title="2nd place">🥈</span>
                    ) : i === 2 ? (
                      <span title="3rd place">🥉</span>
                    ) : (
                      <span className="font-mono text-sm text-muted-foreground/40">
                        {i + 1}
                      </span>
                    )}
                  </td>

                  {/* Model name + tags + date */}
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground whitespace-nowrap">
                          {model.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">
                          {model.provider}
                        </span>
                        <span className="text-[10px] text-muted-foreground/25 font-mono">
                          {model.date}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {model.tags
                          .filter((t) => t !== "dense")
                          .map((t) => (
                            <Tag key={t} tag={t} />
                          ))}
                      </div>
                    </div>
                  </td>

                  {/* Params */}
                  <td className="px-3 py-3">
                    {model.activeParams ? (
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-muted-foreground">{model.params}</span>
                        <span className="font-mono text-[10px] text-muted-foreground/50">{model.activeParams} active</span>
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {model.params}
                      </span>
                    )}
                  </td>

                  {/* US */}
                  <td className="px-3 py-3">
                    <div className="flex justify-end">
                      <QualityBar score={model.scores.us} country="United States" />
                    </div>
                  </td>

                  {/* Nigeria */}
                  <td className="px-3 py-3">
                    <div className="flex justify-end">
                      <QualityBar score={model.scores.nigeria} country="Nigeria" />
                    </div>
                  </td>

                  {/* Ghana */}
                  <td className="px-3 py-3 pr-4">
                    <div className="flex justify-end">
                      <QualityBar score={model.scores.ghana} country="Ghana" />
                    </div>
                  </td>
                </motion.tr>
              ))}

              {/* Separator */}
              {pending.length > 0 && (
                <tr className="border-b border-border">
                  <td colSpan={6} className="py-2 pl-4 text-[10px] uppercase tracking-widest text-muted-foreground/30 font-semibold">
                    Coming soon
                  </td>
                </tr>
              )}

              {/* Pending models */}
              {pending.map((model, i) => (
                <motion.tr
                  key={model.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + (verified.length + i) * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="border-b border-border/30 transition-colors hover:bg-white/[0.01]"
                >
                  {/* No rank */}
                  <td className="py-3 pl-4 pr-2 text-center">
                    <span className="font-mono text-sm text-muted-foreground/20">&mdash;</span>
                  </td>

                  {/* Model name + tags + date */}
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground/40 whitespace-nowrap">
                          {model.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground/25">
                          {model.provider}
                        </span>
                        <span className="text-[10px] text-muted-foreground/20 font-mono">
                          {model.date}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 opacity-50">
                        {model.tags
                          .filter((t) => t !== "dense")
                          .map((t) => (
                            <Tag key={t} tag={t} />
                          ))}
                      </div>
                    </div>
                  </td>

                  {/* Params */}
                  <td className="px-3 py-3">
                    {model.activeParams ? (
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-muted-foreground/30">{model.params}</span>
                        <span className="font-mono text-[10px] text-muted-foreground/20">{model.activeParams} active</span>
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground/30 whitespace-nowrap">
                        {model.params}
                      </span>
                    )}
                  </td>

                  {/* US */}
                  <td className="px-3 py-3">
                    <div className="flex justify-end">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-white/[0.03] sm:w-20" />
                        <span className="w-10 text-right font-mono text-[10px] text-muted-foreground/20 italic">
                          {model.refs.us > 0 ? `${model.refs.us}` : "\u2014"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Nigeria */}
                  <td className="px-3 py-3">
                    <div className="flex justify-end">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-white/[0.03] sm:w-20" />
                        <span className="w-10 text-right font-mono text-[10px] text-muted-foreground/20 italic">
                          {model.refs.nigeria > 0 ? `${model.refs.nigeria}` : "\u2014"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Ghana */}
                  <td className="px-3 py-3 pr-4">
                    <div className="flex justify-end">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-white/[0.03] sm:w-20" />
                        <span className="w-10 text-right font-mono text-[10px] text-muted-foreground/20 italic">
                          {model.refs.ghana > 0 ? `${model.refs.ghana}` : "\u2014"}
                        </span>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* ── Key Insights ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 rounded-xl border border-border/50 bg-card/50 p-5"
        >
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Key Findings
          </h3>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              <span className="text-emerald-400 font-medium">Scaling works:</span>{" "}
              Llama 8B &rarr; 70B &rarr; 405B quality rises 0.19 &rarr; 0.37 &rarr; 0.79
            </p>
            <p>
              <span className="text-violet-400 font-medium">Active params matter:</span>{" "}
              GPT-OSS (5.1B active / 120B MoE) scores below Llama 8B dense
            </p>
            <p>
              <span className="text-amber-400 font-medium">Training purpose:</span>{" "}
              Cohere R+ (104B, conversational focus) scores 0.14 &mdash; below Llama 8B
            </p>
            <p>
              <span className="text-red-400 font-medium">Geography effect:</span>{" "}
              Every model degrades US &rarr; Nigeria &rarr; Ghana. Training data representation drives error.
            </p>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="relative z-10 mt-auto border-t border-border px-6 py-6"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground/50">
            <span className="font-mono">{totalRefs.toLocaleString()}</span> references collected
            &middot; <span className="font-mono">4,700</span> verified
            &middot; 24 topics &times; 10 refs per experiment
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-muted-foreground/50 transition-colors hover:text-foreground"
            >
              Hallucination Calculator
            </Link>
            <span className="text-muted-foreground/20">|</span>
            <a
              href="https://sourceverify.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground/50 transition-colors hover:text-foreground"
            >
              SourceVerify.ai
            </a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
