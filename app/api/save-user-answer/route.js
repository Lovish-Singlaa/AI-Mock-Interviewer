import Interview from '@/models/interviewSchema';
import dbConnect from '@/utils/db';

export async function POST(request){
    await dbConnect();
    const { interviewId, userResponse, feedback, questionIndex } = await request.json();
    const interview = await Interview.findById(interviewId);
    if(!interview){
        return Response.json({message: "Interview not found"}, {status: 404});
    }
    
    if(!userResponse || !feedback){
        return Response.json({message: "All fields are required"}, {status: 400});
    }
    if(!interview.questions[questionIndex]){
        return Response.json({message: "Question not found"}, {status: 404});
    }
    interview.questions[questionIndex].userResponse = userResponse;
    interview.questions[questionIndex].feedback = feedback.feedback;
    interview.questions[questionIndex].rating = feedback.rating;

    interview.markModified('questions');
    console.log("Before saving interview");
    await interview.save({ validateBeforeSave: true });
    console.log("After saving interview");
    return Response.json({message: "User answer saved successfully"}, {status: 200});
}