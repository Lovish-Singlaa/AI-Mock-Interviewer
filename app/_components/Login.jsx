"use client"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emojiHovered, setEmojiHovered] = useState(false);

    const router = useRouter();

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await axios.post('/api/auth/login',{ email, password })
        if(response.status==201){
          toast.success("Login Successful! 🎉");
          router.push('/dashboard')
        }
      } catch (error) {
        toast.error(error.message)
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
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30"
          style={{ background: "#6C3FFE", filter: "blur(80px)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-25"
          style={{ background: "#FF5E7D", filter: "blur(80px)" }}
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
          {/* Header strip */}
          <div className="h-1.5 w-full" style={{ background: "#6C3FFE" }} />

          <div className="p-8 md:p-10">
            {/* Logo + Title */}
            <div className="text-center mb-8">
              <motion.div
                className="text-6xl mb-4 inline-block cursor-default"
                animate={emojiHovered
                  ? { scale: 1.4, rotate: 20 }
                  : { y: [0, -10, 0], rotate: [0, 5, 0] }
                }
                transition={emojiHovered
                  ? { type: "spring", stiffness: 400, damping: 10 }
                  : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }
                onMouseEnter={() => setEmojiHovered(true)}
                onMouseLeave={() => setEmojiHovered(false)}
              >
                👋
              </motion.div>
              <h1 className="text-3xl font-extrabold text-primary mb-2">Welcome Back!</h1>
              <p className="text-muted-foreground text-sm">Sign in to continue your interview prep</p>
            </div>

            {/* Form */}
            <motion.form
              onSubmit={handleLogin}
              className="space-y-5"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            >
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
                    placeholder="Your password"
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
                  className="w-full h-12 rounded-xl font-bold text-base text-white btn-modern"
                  style={{ background: "#6C3FFE" }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spinner" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign In 🚀"
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "#E5E6F3" }} />
              <span className="text-xs text-muted-foreground font-medium">OR</span>
              <div className="flex-1 h-px" style={{ background: "#E5E6F3" }} />
            </div>

            {/* Sign up link */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-bold text-primary hover:underline">
                  Create one free →
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

export default Login
