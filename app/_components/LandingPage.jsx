import Link from "next/link"
import { ArrowRight, CheckCircle2, LayoutDashboard, MessageSquare, Star, Sparkles, Users, TrendingUp, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold animate-fade-in">
            <div className="relative">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-gradient text-lg font-bold">AI Interview</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-105"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-105"
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-105"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button variant="ghost" asChild className="hover-lift">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="btn-modern hover-glow">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-28 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100/40 dark:bg-purple-900/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="container flex flex-col items-center text-center relative z-10">
            <div className="animate-slide-in-top">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Practice Interviews with{" "}
                <span className="text-gradient">
                  AI
                </span>
              </h1>
            </div>
            <div className="animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
              <p className="mt-6 max-w-[42rem] text-lg text-muted-foreground sm:text-xl md:text-2xl">
                Prepare for your next job interview with our AI-powered interview simulator. Get real-time feedback and
                improve your skills with confidence.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <Button size="lg" asChild className="btn-modern hover-glow text-lg px-8 py-6">
                <Link href="/dashboard">
                  Start Practicing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="hover-lift text-lg px-8 py-6">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Interviews Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">AI Available</div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-slate-100 dark:bg-slate-800">
          <div className="container">
            <div className="mx-auto max-w-[58rem] text-center animate-fade-in">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Everything you need to{" "}
                <span className="text-gradient">ace your next interview</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">Powerful features designed to boost your confidence and performance</p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center group animate-slide-in-left hover-lift p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Realistic Interviews</h3>
                <p className="mt-3 text-muted-foreground">
                  Practice with AI interviewers that simulate real-world scenarios and ask industry-specific questions with natural conversation flow.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group animate-slide-in-top hover-lift p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" style={{ animationDelay: '0.2s' }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Detailed Feedback</h3>
                <p className="mt-3 text-muted-foreground">
                  Get personalized feedback on your responses, communication skills, body language, and specific areas for improvement.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group animate-slide-in-right hover-lift p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" style={{ animationDelay: '0.4s' }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Progress Tracking</h3>
                <p className="mt-3 text-muted-foreground">
                  Monitor your improvement over time with detailed analytics, performance metrics, and skill development insights.
                </p>
              </div>
            </div>

            {/* Additional features */}
            <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
              <div className="flex items-start gap-4 group animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Privacy First</h4>
                  <p className="text-muted-foreground">Your interview data is encrypted and secure. We never share your information with third parties.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Instant Results</h4>
                  <p className="text-muted-foreground">Get immediate feedback and analysis after each interview session to improve quickly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20">
          <div className="container">
            <div className="mx-auto max-w-[58rem] text-center animate-fade-in">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Trusted by{" "}
                <span className="text-gradient">thousands of professionals</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">See what our users have to say about their experience</p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border bg-card p-6 shadow-lg hover-lift animate-slide-in-left">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "This platform helped me prepare for my technical interviews at top tech companies. The AI feedback
                  was spot on and helped me identify areas I needed to work on."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    AJ
                  </div>
                  <div>
                    <p className="text-sm font-medium">Alex Johnson</p>
                    <p className="text-xs text-muted-foreground">Software Engineer at Google</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-lg hover-lift animate-slide-in-top" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "I was nervous about behavioral interviews, but after practicing with this AI tool, I felt much more
                  confident. I landed my dream job at a Fortune 500 company!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-pink-600 flex items-center justify-center text-white font-semibold">
                    SC
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sarah Chen</p>
                    <p className="text-xs text-muted-foreground">Product Manager at Microsoft</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-lg hover-lift animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "The detailed feedback and progress tracking helped me improve my interview skills significantly. I
                  recommend this to anyone preparing for job interviews."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                    MR
                  </div>
                  <div>
                    <p className="text-sm font-medium">Michael Rodriguez</p>
                    <p className="text-xs text-muted-foreground">Data Scientist at Amazon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 bg-slate-100 dark:bg-slate-800">
          <div className="container">
            <div className="mx-auto max-w-[58rem] text-center animate-fade-in">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Frequently Asked{" "}
                <span className="text-gradient">Questions</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">Everything you need to know about our platform</p>
            </div>

            <div className="mx-auto mt-16 max-w-3xl space-y-6">
              <div className="rounded-2xl border bg-card p-6 shadow-lg hover-lift animate-slide-in-left">
                <h3 className="text-lg font-semibold mb-3">How does the AI interview work?</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI uses advanced natural language processing to simulate realistic interview scenarios. It asks
                  questions, analyzes your responses, and provides feedback based on industry standards and best
                  practices.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-lg hover-lift animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg font-semibold mb-3">What types of interviews can I practice?</h3>
                <p className="text-sm text-muted-foreground">
                  We offer technical interviews for various programming languages and roles, behavioral interviews for
                  soft skills assessment, and mixed interviews that combine both aspects.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-lg hover-lift animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-lg font-semibold mb-3">Is my data secure?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, we take data privacy seriously. All your interview recordings and feedback are encrypted and
                  stored securely. We never share your data with third parties without your consent.
                </p>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-lg hover-lift animate-slide-in-right" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-lg font-semibold mb-3">Can I cancel my subscription anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to
                  your plan until the end of your billing period.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="container text-center">
            <div className="mx-auto max-w-3xl animate-fade-in">
              <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl mb-6">
                Ready to ace your next interview?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of professionals who have improved their interview skills with AI
              </p>
              <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-slate-50 text-lg px-8 py-6 btn-modern">
                <Link href="/dashboard">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background/95 backdrop-blur">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 font-semibold">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <span className="text-gradient font-bold">AI Interview</span>
            </div>
            <nav className="flex gap-6">
              <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Features
              </Link>
              <Link href="#testimonials" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Testimonials
              </Link>
              <Link href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                FAQ
              </Link>
            </nav>
            <div className="text-sm text-muted-foreground">
              Made with ❤️ by <Link href="https://www.linkedin.com/in/lovishsinglaa/" target="_blank" className="text-blue-400">Lovish Singla</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

