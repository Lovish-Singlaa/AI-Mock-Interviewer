"use client"
import { Button } from '@/components/ui/button'
import axios from 'axios'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { LogOutIcon } from 'lucide-react'

const Header = () => {
    const [user, setUser] = useState(null)
    const path = usePathname();
    const router = useRouter();
    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await axios.get('/api/user');
                setUser(response.data.user);
            } catch (error) {
                console.log(error)
            }
        }
        getUser()
    }, [path])
    return (
        <div>
            <div className='w-full flex justify-between items-center p-4 bg-gray-100'>
                <Image src="/logo.svg" alt="Logo" width={100} height={100} />
                <div>
                    <ul className='hidden md:flex list-none gap-4 font-semibold'>
                        <li className={`${(path == '/dashboard') ? "text-purple-500" : ""} cursor-pointer`}>Dashboard</li>
                        <li className={`${(path == '/dashboard/questions') ? "text-purple-500" : ""} cursor-pointer`}>Questions</li>
                        <li className={`${(path == '/dashboard/upgrade') ? "text-purple-500" : ""} cursor-pointer`}>Upgrade</li>
                        <li className={`${(path == '/dashboard/how') ? "text-purple-500" : ""} cursor-pointer`}>How It Works?</li>
                    </ul>
                </div>
                <div>
                    {user ? <div>
                        <Popover>
                            <PopoverTrigger>{user.name}</PopoverTrigger>
                            <PopoverContent>
                                <div className='flex items-center'>
                                    <LogOutIcon/><Button variant="ghost">Logout</Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                    </div> :
                        <div className='flex gap-2'>
                            <Button onClick={() => router.push('/signup')}>Signup</Button>
                            <Button onClick={() => router.push('/')}>Login</Button>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Header
