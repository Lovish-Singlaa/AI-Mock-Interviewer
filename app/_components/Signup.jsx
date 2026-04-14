"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emojiHovered, setEmojiHovered] = useState(false);

  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/signup', { name, email, password });
      if(response.status === 201){
        toast.success('Account created! Welcome aboard 🎉');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#F4F4FF" }}>

      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.12, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30"
          style={{ background: "#FF5E7D", filter: "blur(80px)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-25"
          style={{ background: "#6C3FFE", filter: "blur(80px)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-15"
          style={{ background: "#00D4FF", filter: "blur(60px)" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: "rgba(255,255,255,0.95)", border: "1.5px solid #E5E6F3" }}
        >
          {/* Header rainbow strip */}
          <div className="h-1.5 w-full" style={{ background: "#FF5E7D" }} />

          <div className="p-8 md:p-10">
            {/* Logo + Title */}
            <div className="text-center mb-8">
              <motion.div
                className="text-6xl mb-4 inline-block cursor-default"
                animate={emojiHovered
                  ? { scale: 1.4, rotate: -20 }
                  : { y: [0, -12, 0], rotate: [0, -5, 0] }
                }
                transition={emojiHovered
                  ? { type: "spring", stiffness: 400, damping: 10 }
                  : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }
                onMouseEnter={() => setEmojiHovered(true)}
                onMouseLeave={() => setEmojiHovered(false)}
              >
                🚀
              </motion.div>
              <h1 className="text-3xl font-extrabold text-primary mb-2">Create Account</h1>
              <p className="text-muted-foreground text-sm">Join thousands mastering interviews with AI</p>
            </div>

            {/* Perks strip */}
            <div className="flex gap-3 mb-7 flex-wrap justify-center">
              {["Free to start", "AI-powered", "Instant feedback"].map((p, i) => (
                <motion.span
                  key={p}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: ["#EEE5FF","#FFE8EF","#E5FFF5"][i],
                    color: ["#6C3FFE","#FF5E7D","#00C47A"][i]
                  }}
                >
                  ✓ {p}
                </motion.span>
              ))}
            </div>

            {/* Form */}
            <motion.form
              onSubmit={handleSignup}
              className="space-y-4"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div variants={fadeUp} className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="pl-11 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-11 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-11 pr-11 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-bold text-base text-white btn-modern mt-2"
                  style={{ background: "#FF5E7D" }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spinner" />
                      Creating account...
                    </div>
                  ) : (
                    "Create My Account 🎯"
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "#E5E6F3" }} />
              <span className="text-xs text-muted-foreground font-medium">OR</span>
              <div className="flex-1 h-px" style={{ background: "#E5E6F3" }} />
            </div>

            {/* Login link */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-primary hover:underline">
                  Sign in →
                </Link>
              </p>
              <Link href="/" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                ← Back to home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup
