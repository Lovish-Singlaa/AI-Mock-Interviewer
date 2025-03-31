"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Router } from 'next/router';
import React, { useState } from 'react'
import { toast } from 'sonner';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/signup', {
        name,
        email,
        password
      });
      if(response.status === 201){
        toast.success('User created successfully');
        Router.push('/dashboard');
      }
    } catch (error) {
      console.log('Error details', error);
    }
  }

  return (
    <div className='flex flex-col gap-4 w-1/4 mx-auto mt-20 border p-4 rounded-md'>
        <h1 className='font-bold text-3xl my-3'>Signup</h1>
        <form onSubmit={handleSignup}>
            <Label className='my-2'>Name</Label>
            <Input type='text' onChange={(e) => setName(e.target.value)} value={name} placeholder='Enter your name' />
            <Label className='my-2'>Email</Label>
            <Input type='text' onChange={(e) => setEmail(e.target.value)} value={email} placeholder='Enter your email' />
            <Label className='my-2'>Password</Label>
            <Input type='password' onChange={(e) => setPassword(e.target.value)} value={password} placeholder='Enter your password' />
            <Button className='my-2 w-full' type='submit'>Signup</Button>
        </form>
    </div>
  )
}

export default Signup
