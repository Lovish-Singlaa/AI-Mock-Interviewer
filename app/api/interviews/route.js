import Interview from '@/models/interviewSchema';
import User from '@/models/userSchema';
import dbConnect from '@/utils/db';

export async function POST(request) {
    try {
        await dbConnect();
        const data = await request.json();
        
        if(!data){
            return new Response(JSON.stringify({
                success: false,
                message: "Data not found!"
            }),{
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }
        const userId = data.userId;
        const interview = await Interview.create({
            jobRole: data.jobRole,
            jobDescription: data.jobDesc,
            experience: data.jobExp,
            questions: data.questions,
            userId: data.userId,
            score: 0
        });
        await User.findByIdAndUpdate(userId, { 
            $push: { interviews: interview._id }
          });

        return new Response(JSON.stringify({
            success: true,
            interviewId: interview._id
        }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }), 
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}