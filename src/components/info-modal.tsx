"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface InfoModalProps {
  open: boolean
  onClose: () => void
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
                (SourceVerify Reference Integrity Score).
              </p>

              <p>
                Each reference was classified into one of four categories:
              </p>

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

              <p>
                Predictions are driven by three factors: the volume of academic literature on the topic (from OpenAlex), the country&apos;s total scholarly output, and model size. Together these explain 30% of the variance (R&sup2; = 0.302).
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
