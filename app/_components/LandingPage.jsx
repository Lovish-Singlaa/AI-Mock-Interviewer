"use client"
import Link from "next/link"
import { ArrowRight, CheckCircle2, MessageSquare, Star, Sparkles, TrendingUp, Shield, Zap, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
}
const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
}
const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
}
const stagger = {
  show: { transition: { staggerChildren: 0.12 } }
}

function FloatingEmoji({ emoji, className, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      className={`text-5xl select-none cursor-default absolute ${className}`}
      animate={hovered ? { scale: 1.4, rotate: 15 } : { y: [0, -16, 0], rotate: [0, 3, 0] }}
      transition={hovered
        ? { type: "spring", stiffness: 400, damping: 10 }
        : { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay }
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {emoji}
    </motion.div>
  )
}

function StatCounter({ value, label, color }) {
  return (
    <motion.div
      variants={fadeUp}
      className="text-center"
    >
      <div className={`text-4xl font-extrabold mb-1`} style={{ color }}>
        {value}
      </div>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
    </motion.div>
  )
}

function FeatureCard({ icon, emoji, title, description, color, delay }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      variants={fadeUp}
      className="vibrant-card p-8 flex flex-col items-center text-center group cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ animationDelay: `${delay}s` }}
    >
      <motion.div
        className="text-5xl mb-5"
        animate={hovered ? { scale: 1.35, rotate: 12 } : { y: [0, -10, 0], rotate: [0, 2, 0] }}
        transition={hovered
          ? { type: "spring", stiffness: 350, damping: 12 }
          : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {emoji}
      </motion.div>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-5"
        style={{ background: color }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
    </motion.div>
  )
}

function TestimonialCard({ name, role, quote, initials, color, delay }) {
  return (
    <motion.div variants={fadeUp} className="vibrant-card p-7">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-5 italic leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: color }}>
          {initials}
        </div>
        <div>
          <p className="text-sm font-bold">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  )
}

function FaqItem({ question, answer, delay }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      variants={fadeUp}
      className="vibrant-card p-6 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center gap-4">
        <h3 className="text-base font-bold">{question}</h3>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-2xl text-primary shrink-0"
        >
          +
        </motion.div>
      </div>
      <motion.div
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        initial={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  )
}

function SectionWrapper({ children, className = "" }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#F4F4FF" }}>

      {/* ── NAVBAR ── */}
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ background: "rgba(244,244,255,0.85)", borderColor: "#E5E6F3" }}
      >
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
              style={{ background: "#6C3FFE" }}>
              🤖
            </div>
            <span className="text-lg font-extrabold text-primary">InterviewAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {["Features", "Testimonials", "FAQ"].map(item => (
              <Link key={item} href={`#${item.toLowerCase()}`}
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-200">
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="font-semibold">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="btn-primary font-bold text-sm px-5 py-2 rounded-xl">
              <Link href="/dashboard">Get Started →</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-28">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 animate-morph"
            style={{ background: "#6C3FFE" }} />
          <div className="absolute -bottom-32 -right-24 w-[420px] h-[420px] rounded-full opacity-15 animate-morph"
            style={{ background: "#FF5E7D", animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-10"
            style={{ background: "#00D4FF", filter: "blur(60px)" }} />
        </div>

        {/* Floating emojis */}
        <FloatingEmoji emoji="🎯" className="top-16 left-[8%]" delay={0} />
        <FloatingEmoji emoji="💡" className="top-24 right-[9%]" delay={0.8} />
        <FloatingEmoji emoji="🚀" className="bottom-20 left-[12%]" delay={1.4} />
        <FloatingEmoji emoji="⭐" className="bottom-16 right-[8%]" delay={0.4} />

        <div className="container relative z-10 flex flex-col items-center text-center">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
            className="mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold bg-primary/10 border-primary/30 text-primary"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered Mock Interviewer
            <Sparkles className="h-4 w-4" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none mb-6"
          >
            Ace Your Next{" "}
            <span className="text-primary block sm:inline">Interview 🎤</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="max-w-xl text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
          >
            Practice with an AI that speaks your industry's language. Get instant, personalized feedback and land the job you deserve.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          >
            <Button size="lg" asChild className="btn-primary text-base px-8 py-6 rounded-2xl font-bold shadow-xl">
              <Link href="/dashboard">
                Start Practicing Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild
              className="text-base px-8 py-6 rounded-2xl font-bold border-2 hover:border-primary transition-colors">
              <Link href="#features">
                <Play className="mr-2 h-4 w-4" />
                See How It Works
              </Link>
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 gap-10 w-full max-w-md"
          >
            <StatCounter value="10K+" label="Interviews Done" color="#6C3FFE" />
            <StatCounter value="95%" label="Success Rate" color="#FF5E7D" />
            <StatCounter value="24/7" label="AI Available" color="#00C47A" />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24" style={{ background: "#FFFFFF" }}>
        <div className="container">
          <SectionWrapper className="mx-auto max-w-2xl text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ color: "#FF5E7D" }}>Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Everything you need to{" "}
              <span className="text-primary">crush interviews 💪</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg">
              Powerful tools designed to build real confidence, fast.
            </motion.p>
          </SectionWrapper>

          <SectionWrapper className="grid gap-7 md:grid-cols-3">
            <FeatureCard
              emoji="🗣️"
              icon={<MessageSquare className="h-6 w-6" />}
              title="Realistic Simulations"
              description="AI interviewers that adapt in real-time — just like a real panel interview with industry-specific follow-ups."
              color="#6C3FFE"
              delay={0}
            />
            <FeatureCard
              emoji="📊"
              icon={<Star className="h-6 w-6" />}
              title="Instant Smart Feedback"
              description="Get detailed scores on clarity, confidence, and content within seconds of completing your session."
              color="#FF5E7D"
              delay={0.1}
            />
            <FeatureCard
              emoji="📈"
              icon={<TrendingUp className="h-6 w-6" />}
              title="Progress Analytics"
              description="Track your skill growth with visual dashboards and understand exactly where to focus next."
              color="#00C47A"
              delay={0.2}
            />
          </SectionWrapper>

          {/* 2-column extra features */}
          <SectionWrapper className="grid gap-6 md:grid-cols-2 mt-8 max-w-4xl mx-auto">
            {[
              { emoji: "🔒", color: "#6C3FFE", title: "Privacy First", desc: "All data is end-to-end encrypted. We never share your interviews with anyone." },
              { emoji: "⚡", color: "#FF5E7D", title: "Instant Results", desc: "No waiting. Feedback arrives live as your interview session concludes." },
            ].map(({ emoji, color, title, desc }) => (
              <motion.div key={title} variants={fadeUp}
                className="vibrant-card p-6 flex items-start gap-5">
                <div className="text-4xl shrink-0 emoji-hover">{emoji}</div>
                <div>
                  <h4 className="text-base font-bold mb-1">{title}</h4>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </motion.div>
            ))}
          </SectionWrapper>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24" style={{ background: "#F4F4FF" }}>
        <div className="container">
          <SectionWrapper className="mx-auto max-w-2xl text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ color: "#6C3FFE" }}>Testimonials</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Loved by thousands of{" "}
              <span className="text-primary">job seekers 🙌</span>
            </motion.h2>
          </SectionWrapper>

          <SectionWrapper className="grid gap-6 md:grid-cols-3">
            <TestimonialCard
              name="Alex Johnson" role="SWE @ Google"
              initials="AJ" color="#6C3FFE"
              quote="The AI feedback helped me pinpoint exactly what was holding me back. Landed my dream role after just 2 weeks of practice!"
            />
            <TestimonialCard
              name="Sarah Chen" role="PM @ Microsoft"
              initials="SC" color="#FF5E7D"
              quote="I was terrified of behavioral rounds. After 10 sessions here, I walked into my interview feeling like a pro. 10/10 recommend."
            />
            <TestimonialCard
              name="Michael Rodriguez" role="Data Scientist @ Amazon"
              initials="MR" color="#00C47A"
              quote="The detailed analytics showed me my improvement week by week. It's like having a personal career coach available at 2am!"
            />
          </SectionWrapper>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24" style={{ background: "#FFFFFF" }}>
        <div className="container">
          <SectionWrapper className="mx-auto max-w-2xl text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ color: "#FF5E7D" }}>FAQ</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Got questions? <span className="text-primary">We've got answers 🤔</span>
            </motion.h2>
          </SectionWrapper>

          <SectionWrapper className="mx-auto max-w-3xl space-y-4">
            <FaqItem
              question="How does the AI interviewer actually work?"
              answer="Our AI uses advanced large language models to generate realistic, role-specific questions and analyzes your audio/text responses in real time, scoring you on communication clarity, confidence signals, and technical accuracy."
            />
            <FaqItem
              question="What interview types are available?"
              answer="Technical, Behavioral, Leadership, Case Study, System Design, Coding, and General interviews — all with adjustable difficulty from Beginner to Advanced."
            />
            <FaqItem
              question="Is my data private and secure?"
              answer="Absolutely. All interview data is encrypted with AES-256. We never sell or share your personal information or interview recordings with third parties."
            />
            <FaqItem
              question="Can I cancel my subscription anytime?"
              answer="Yes — no lock-in, ever. Cancel at any time from your dashboard and keep access until the end of your billing period."
            />
          </SectionWrapper>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 left-[10%] text-5xl animate-float" style={{ animationDelay: "0s" }}>🎉</div>
          <div className="absolute bottom-8 right-[10%] text-5xl animate-float" style={{ animationDelay: "1s" }}>🏆</div>
        </div>
        <div className="container relative z-10 text-center">
          <SectionWrapper>
            <motion.h2 variants={fadeUp}
              className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Ready to ace your next interview?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
              Join 10,000+ professionals sharpening their skills with AI today.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button size="lg" asChild
                className="bg-white text-primary font-bold text-lg px-10 py-7 rounded-2xl shadow-2xl hover:shadow-white/30 transition-all hover:-translate-y-1">
                <Link href="/dashboard">
                  Start Free Today <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </SectionWrapper>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-10" style={{ background: "#FFFFFF", borderColor: "#E5E6F3" }}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
              style={{ background: "#6C3FFE" }}>
              🤖
            </div>
            <span className="font-extrabold text-primary">InterviewAI</span>
          </Link>
          <nav className="flex gap-6">
            {["features", "testimonials", "faq"].map(s => (
              <Link key={s} href={`#${s}`}
                className="text-sm capitalize text-muted-foreground hover:text-primary transition-colors">
                {s}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ by{" "}
            <a href="https://www.linkedin.com/in/lovishsinglaa/" target="_blank"
              className="font-semibold text-primary hover:underline">
              Lovish Singla & Shikhar Kanaujia
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
