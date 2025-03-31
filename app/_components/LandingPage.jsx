import Link from "next/link"
import { ArrowRight, CheckCircle2, LayoutDashboard, MessageSquare, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-5 w-5" />
            <span>AI Interview</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            {/* <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link> */}
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Practice Interviews with <span className="text-primary">AI</span>
            </h1>
            <p className="mt-6 max-w-[42rem] text-lg text-muted-foreground sm:text-xl">
              Prepare for your next job interview with our AI-powered interview simulator. Get real-time feedback and
              improve your skills.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Start Practicing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-[58rem] text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Features</h2>
              <p className="mt-4 text-lg text-muted-foreground">Everything you need to ace your next interview</p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Realistic Interviews</h3>
                <p className="mt-2 text-muted-foreground">
                  Practice with AI interviewers that simulate real-world scenarios and ask industry-specific questions.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Detailed Feedback</h3>
                <p className="mt-2 text-muted-foreground">
                  Get personalized feedback on your responses, communication skills, and areas for improvement.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Progress Tracking</h3>
                <p className="mt-2 text-muted-foreground">
                  Monitor your improvement over time with detailed analytics and performance metrics.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20">
          <div className="container">
            <div className="mx-auto max-w-[58rem] text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Testimonials</h2>
              <p className="mt-4 text-lg text-muted-foreground">See what our users have to say</p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  "This platform helped me prepare for my technical interviews at top tech companies. The AI feedback
                  was spot on and helped me identify areas I needed to work on."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <p className="text-sm font-medium">Alex Johnson</p>
                    <p className="text-xs text-muted-foreground">Software Engineer</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  "I was nervous about behavioral interviews, but after practicing with this AI tool, I felt much more
                  confident. I landed my dream job at a Fortune 500 company!"
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <p className="text-sm font-medium">Sarah Chen</p>
                    <p className="text-xs text-muted-foreground">Product Manager</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  "The detailed feedback and progress tracking helped me improve my interview skills significantly. I
                  recommend this to anyone preparing for job interviews."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <p className="text-sm font-medium">Michael Rodriguez</p>
                    <p className="text-xs text-muted-foreground">Data Scientist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <section id="pricing" className="py-20 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-[58rem] text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pricing</h2>
              <p className="mt-4 text-lg text-muted-foreground">Choose the plan that's right for you</p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="mt-2 text-4xl font-bold">$0</p>
                <p className="text-sm text-muted-foreground">per month</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">3 practice interviews</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic feedback</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Limited question bank</span>
                  </li>
                </ul>
                <Button className="mt-6 w-full" variant="outline" asChild>
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Popular
                </div>
                <h3 className="text-xl font-semibold">Pro</h3>
                <p className="mt-2 text-4xl font-bold">$19</p>
                <p className="text-sm text-muted-foreground">per month</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited interviews</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Detailed feedback</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Full question bank</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Progress tracking</span>
                  </li>
                </ul>
                <Button className="mt-6 w-full" asChild>
                  <Link href="/dashboard">Subscribe</Link>
                </Button>
              </div>

              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-semibold">Enterprise</h3>
                <p className="mt-2 text-4xl font-bold">$99</p>
                <p className="text-sm text-muted-foreground">per month</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Team management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom interview templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
                <Button className="mt-6 w-full" variant="outline" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section> */}

        <section id="faq" className="py-20">
          <div className="container">
            <div className="mx-auto max-w-[58rem] text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mt-4 text-lg text-muted-foreground">Answers to common questions about our platform</p>
            </div>

            <div className="mx-auto mt-16 max-w-3xl space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">How does the AI interview work?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our AI uses advanced natural language processing to simulate realistic interview scenarios. It asks
                  questions, analyzes your responses, and provides feedback based on industry standards and best
                  practices.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">What types of interviews can I practice?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We offer technical interviews for various programming languages and roles, behavioral interviews for
                  soft skills assessment, and mixed interviews that combine both aspects.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">Is my data secure?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Yes, we take data privacy seriously. All your interview recordings and feedback are encrypted and
                  stored securely. We never share your data with third parties without your consent.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">Can I cancel my subscription anytime?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to
                  your plan until the end of your billing period.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 font-semibold">
              <LayoutDashboard className="h-5 w-5" />
              <span>AI Interview</span>
            </div>
            <nav className="flex gap-6">
              <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Testimonials
              </Link>
              <Link href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                FAQ
              </Link>
            </nav>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Interview. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

