"use client"
import { UserContext } from '@/app/context/UserContext'
import React, { useContext, useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import axios from 'axios'

const page = () => {
    const { user, setUser } = useContext(UserContext)
    const [interviews,setInterviews] = useState(null)
    const [fetching, setFetching] = useState(false)
    

    function formatDate(dateString) {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(date)
    }

    useEffect(() => {

        const getInterviews = async () => {
            try {
                setFetching(true);
                const response = await axios.get('/api/get-interviews', {})
                setInterviews(response.data);
            } catch (error) {
                console.error('Error fetching interviews:', error);
                setInterviews([]);
            } finally {
                setFetching(false);
            }
        }
        if (user) getInterviews();
    }, [user])

    // useEffect(()=>{
    //     setInterviews(user?.interviews)
    //     console.log(user?.interviews);
        
    // },[user])
    return (
        <div>
            {interviews && interviews.length > 0 ? (

                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4'>
                    {interviews.map((interview, index) => (
                        <div key={index}>
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{interview.jobRole}</CardTitle>
                                    </div>
                                    <CardDescription>{formatDate(interview.createdAt)}</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Layers className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {interview.jobDescription} • {interview.experience} years
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant={interview.score === 0 ? "" : "outline"} size="sm" className="w-full" asChild>
                                        <Link href={interview.score === 0 ? `/dashboard/interviews/${interview._id}` : `/dashboard/interviews/${interview._id}/feedback`}>
                                            {interview.score === 0 ? "Start Interview" : "View Results"}
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                    ))}
                </div>)
                :
                <p className='text-gray-600 mt-4 my-2 text-xl w-full mx-auto'>No interviews found</p>}
        </div>
    )
}

export default page
