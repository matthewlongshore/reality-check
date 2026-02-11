"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

type ModalContent = "methodology" | "predictability" | "limitations"

interface InfoModalProps {
  open: ModalContent | null
  onClose: () => void
}

function MethodologyContent() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        What does this mean?
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Every prediction is based on a regression model calibrated on 1,435 LLM-generated academic references that were verified using{" "}
          <a
            href="https://sourceverify.ai/en/svris"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            SVRIS
          </a>{" "}
          (SourceVerify Reference Identity Standard).
        </p>

        <p>Each reference was classified into one of four categories:</p>

        <div className="space-y-2 pl-1">
          <div className="flex items-start gap-2">
            <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span><span className="text-foreground font-medium">Verified</span> — Reference confirmed as real with correct metadata.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-yellow-500" />
            <span><span className="text-foreground font-medium">Verified with error</span> — Real paper found, but with metadata errors (wrong year, misspelled author, etc.).</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-orange-500" />
            <span><span className="text-foreground font-medium">Needs review</span> — Cannot be automatically confirmed or denied; ambiguous match.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-red-500" />
            <span><span className="text-foreground font-medium">Unverified</span> — No matching real publication found; likely fabricated.</span>
          </div>
        </div>

        <p>
          The <span className="text-foreground font-medium">predicted error rate</span> is the proportion of references expected to fall into the <span className="text-foreground">Needs review</span> + <span className="text-foreground">Unverified</span> categories — references that could not be confirmed as real.
        </p>
      </div>
    </>
  )
}

function PredictabilityContent() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Is this really predictable?
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          It seems so!
        </p>

        <p>
          LLMs don&apos;t store facts as discrete records. They encode knowledge as overlapping activation patterns across a shared parameter space — a phenomenon called{" "}
          <a
            href="https://arxiv.org/abs/2501.04693"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            superposition
          </a>
          . Every concept shares dimensions with other concepts. This is how a model can &quot;know&quot; far more things than it has parameters.
        </p>

        <p>
          The trade-off is noise. When a topic is well-represented in training data, its activation pattern is strong and distinct — the signal dominates. When a topic is rare, its pattern is weaker and overlaps more with neighbouring concepts. The model still activates confidently, but the signal is noisy, and errors creep in progressively: first wrong metadata, then ambiguous matches, then outright fabrications.
        </p>

        <p>
          It turns out that superposition and error rates follow a law — interference between overlapping concepts scales as 1/m, where m is the number of dimensions available. This means the level of errors one can expect is predictable. If we know the model size and have an idea of the relative representation of a topic in the training set, we can predict research errors — specifically the reliability of detailed retrieval tasks like generating citations — based on three factors:
        </p>

        <div className="space-y-2 pl-1">
          <p>
            <span className="text-foreground font-medium">Model size</span> — More parameters means more dimensions, so less overlap between concepts. This is the strongest predictor (~22% of variance).
          </p>
          <p>
            <span className="text-foreground font-medium">Topic volume</span> — More literature sharpens the internal representation. Each 10x increase in papers reduces errors by ~12 pp. The first 1,000 papers matter enormously; going from 100K to 1M barely moves the needle.
          </p>
          <p>
            <span className="text-foreground font-medium">Country volume</span> — A country&apos;s scholarly footprint determines how well the model can constrain geographic context. Each 10x increase reduces errors by ~12 pp.
          </p>
        </div>

        <p>
          Together these explain 30% of variance (R&sup2; = 0.302, all p &lt; 0.001). The remaining 70% is topic-level noise. But the systematic component is robust and monotonic — which is why we can predict it.
        </p>

        <p className="text-muted-foreground/60 text-xs">
          Based on 1,435 verified references across 24 topics, 3 countries, and 2 model sizes.
        </p>
      </div>
    </>
  )
}

function LimitationsContent() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Is this always correct?
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          No. This is a statistical estimate, not a guarantee. The model captures the <span className="text-foreground font-medium">systematic</span> pattern — the part of hallucination rates that is predictable from topic volume, country, and model size. Several important caveats apply:
        </p>

        <p>
          <span className="text-foreground font-medium">70% of variance is unexplained.</span> Individual topics can be significantly better or worse than predicted. A niche topic that happens to have strong representation in a specific model&apos;s training data may perform much better than expected. Conversely, a seemingly broad topic with poor training coverage may perform worse.
        </p>

        <p>
          <span className="text-foreground font-medium">The model was trained on one model family.</span> Both models tested (GPT-5 and GPT-5-nano) are from OpenAI. Other model families — Claude, Gemini, Llama — may show different absolute rates, though the directional patterns (more data = fewer errors, bigger model = fewer errors) are likely to hold.
        </p>

        <p>
          <span className="text-foreground font-medium">Only English-speaking countries were tested.</span> The three study countries (US, Nigeria, Ghana) are all primarily Anglophone. Non-English contexts may show additional language-related effects.
        </p>

        <p>
          <span className="text-foreground font-medium">OpenAlex is a proxy, not ground truth.</span> We use OpenAlex work counts as a proxy for how well a topic is represented in model training data. The actual training data composition is unknown and may differ.
        </p>

        <p>
          <span className="text-foreground font-medium">Small model predictions hit a ceiling.</span> When the flagship rate is already high, adding the small-model penalty pushes predictions toward 100%. Above ~90%, treat predictions as &quot;extremely high risk&quot; rather than precise estimates.
        </p>

        <p>
          <span className="text-foreground font-medium">This predicts detailed retrieval errors, not general accuracy.</span> LLMs don&apos;t necessarily err on general knowledge — even small models can summarise and reason competently. But when you ask for specific, detailed information (exact paper titles, real authors, correct DOIs), you&apos;re asking the model to resolve fine-grained distinctions in its representation space. That&apos;s where these error rates apply. General question-answering or summarisation may be more reliable even in low-resource domains.
        </p>

        <p>
          <span className="text-foreground font-medium">More model families need testing.</span> Confirming the relationship across large and small models from different providers (Claude, Gemini, Llama) and at different parameter sizes would strengthen the predictive framework considerably.
        </p>

        <p className="text-muted-foreground/60 text-xs">
          The ± value shown with each prediction is the 95% confidence interval on the mean estimate.
        </p>
      </div>
    </>
  )
}

export function InfoModal({ open, onClose }: InfoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md max-h-[70vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 cursor-pointer text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {open === "methodology" && <MethodologyContent />}
            {open === "predictability" && <PredictabilityContent />}
            {open === "limitations" && <LimitationsContent />}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
