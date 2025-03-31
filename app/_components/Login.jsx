"use client"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();

    const handleLogin = async () => {
      try {
        const response = await axios.post('/api/auth/login',{
          email,
          password
        })
        if(response.status==201){
          toast.success("Login Successful!");
          router.push('/dashboard')
        }
      } catch (error) {
        toast.error(error.message)
        console.log(error)
      }
    }
    
  return (
    <div className='flex flex-col gap-4 w-1/4 mx-auto mt-20 border p-4 rounded-md'>
      <h1 className='text-2xl font-bold'>Login</h1>
      <Label className='my-2'>Email</Label>
      <Input type='text' onChange={(e) => setEmail(e.target.value)} value={email} placeholder='Enter your email' />
      <Label className='my-2'>Password</Label>
      <Input type='password' onChange={(e) => setPassword(e.target.value)} value={password} placeholder='Enter your password' />
      <button onClick={handleLogin} className='bg-blue-500 text-white p-2 rounded-md'>Login</button>
      <div className='text-sm'>New User? <Link href="/signup"><span className='text-blue-400'>Create Account</span></Link></div>
    </div>
  )
}

export default Login
