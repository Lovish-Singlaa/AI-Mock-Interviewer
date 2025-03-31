import Interview from '@/models/interviewSchema';
import dbConnect from '@/utils/db';

export async function GET(request){
    await dbConnect();
    const { searchParams } = new URL(request.url);
        const interviewId = searchParams.get('id');

        if (!interviewId) {
            return Response.json(
                { success: false, error: "Interview ID is required" },
                { status: 400 }
            );
        }
    const interview = await Interview.findById(interviewId);
    if(!interview){
        return Response.json({error: "Interview not found"}, {status: 404});
    }
    return Response.json(interview);
}