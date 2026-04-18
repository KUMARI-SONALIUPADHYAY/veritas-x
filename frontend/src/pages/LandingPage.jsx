import { motion } from 'framer-motion'
import { Activity, BellRing, BrainCircuit, Image, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  { title: 'AI Analysis', icon: BrainCircuit, desc: 'Evidence-first reasoning engine with confidence-aware verdicts.' },
  { title: 'Image Detection', icon: Image, desc: 'OCR, manipulation indicators, and trust context fusion.' },
  { title: 'Web Verification', icon: ShieldCheck, desc: 'Intent-driven source grouping with contradiction checks.' },
  { title: 'Real-time Alerts', icon: BellRing, desc: 'Live risk streams from extension + SaaS workspace.' },
]

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden px-6 pb-20 pt-12">
      <div className="pointer-events-none absolute inset-0 vx-grid-bg opacity-25" />

      {/* HERO */}
      <section className="mx-auto max-w-6xl text-center">

        {/* ✅ FIXED (moved inside return) */}
        <h1 className="text-4xl font-bold text-white">
          AI-Powered Scam Detection Platform
        </h1>

        <p className="text-muted-text mt-2">
          Real-time phishing, fraud, and malicious content detection across text, URLs, images, and video.
        </p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-cyan-300"
        >
          VERITAS X AI Security Platform
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-5 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl"
        >
          Detect Scams. <span className="vx-gradient-text">Verify Truth.</span> Instantly.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-5 max-w-2xl text-base text-slate-300"
        >
          Autonomous threat intelligence for websites, images, and videos with explainable AI verdicts built for modern teams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Link className="vx-btn-primary" to="/login">Get Started</Link>
          <Link className="vx-btn-secondary" to="/app/dashboard">Try Demo</Link>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map((f, idx) => {
          const Icon = f.icon
          return (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + idx * 0.08 }}
              whileHover={{ y: -5 }}
              className="vx-card p-5"
            >
              <Icon className="h-5 w-5 text-cyan-300" />
              <h3 className="mt-3 text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
            </motion.article>
          )
        })}
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto mt-12 max-w-6xl">
        <div className="vx-card p-6">
          <h3 className="text-xl font-bold text-primary-text">How It Works</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { title: '1. Scan', desc: 'URL, image, or video is ingested from extension or dashboard.' },
              { title: '2. Analyze', desc: 'Signals become evidence objects and are validated by AI reasoning.' },
              { title: '3. Result', desc: 'Decision, confidence, and source-backed explanation delivered instantly.' },
            ].map((s) => (
              <div key={s.title} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <p className="text-sm font-semibold text-cyan-300">{s.title}</p>
                <p className="mt-1 text-sm text-muted-text">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto mt-12 max-w-6xl border-t border-border pt-5 text-center text-sm text-muted-text">
        VERITAS X © 2026. AI-Powered Trust & Threat Detection Platform.
      </footer>
    </div>
  )
}