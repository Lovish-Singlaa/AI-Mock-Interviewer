import Interview from '@/models/interviewSchema';
import User from '@/models/userSchema';
import dbConnect from '@/utils/db';
import { chatSession } from '@/utils/GeminiAIModal';

export async function POST(request){
    try {
        await dbConnect();
        const { interviewId, userResponse, feedback, questionIndex, timeSpent } = await request.json();
        
        const interview = await Interview.findById(interviewId);
        if(!interview){
            return Response.json({
                success: false,
                message: "Interview not found"
            }, {status: 404});
        }
        
        if(!userResponse || !feedback){
            return Response.json({
                success: false,
                message: "All fields are required"
            }, {status: 400});
        }
        
        if(!interview.questions[questionIndex]){
            return Response.json({
                success: false,
                message: "Question not found"
            }, {status: 404});
        }

        // Update question with enhanced data, ensuring all required fields are present
        const question = interview.questions[questionIndex];
        question.userResponse = userResponse;
        question.feedback = feedback.feedback || feedback;
        question.rating = feedback.rating || 0;
        question.timeSpent = timeSpent || 0;

        // Ensure required fields are present for the enhanced schema
        if (!question.category) question.category = 'general';
        if (!question.difficulty) question.difficulty = 'medium';
        if (!question.hints) question.hints = [];
        if (!question.keywords) question.keywords = [];
        if (!question.expectedDuration) question.expectedDuration = 180;

        // If we have detailed feedback, store it
        if (feedback.strengths) {
            question.strengths = feedback.strengths;
        }
        if (feedback.weaknesses) {
            question.weaknesses = feedback.weaknesses;
        }
        if (feedback.suggestions) {
            question.suggestions = feedback.suggestions;
        }
        if (feedback.scoreBreakdown) {
            question.scoreBreakdown = feedback.scoreBreakdown;
        }

        // Mark the questions array as modified
        interview.markModified('questions');
        
        // Save the interview (this will trigger the pre-save middleware)
        await interview.save({ validateBeforeSave: true });

        return Response.json({
            success: true,
            message: "User answer saved successfully",
            updatedScore: interview.score,
            analytics: interview.analytics
        }, {status: 200});
    } catch (error) {
        console.error('Error saving user answer:', error);
        return Response.json({
            success: false,
            message: "Failed to save answer",
            error: error.message
        }, {status: 500});
    }
}

// Enhanced evaluation endpoint
export async function PUT(request) {
    try {
        await dbConnect();
        const { interviewId, questionIndex, userResponse } = await request.json();
        
        const interview = await Interview.findById(interviewId);
        if(!interview){
            return Response.json({
                success: false,
                message: "Interview not found"
            }, {status: 404});
        }

        if(!interview.questions[questionIndex]){
            return Response.json({
                success: false,
                message: "Question not found"
            }, {status: 404});
        }

        const question = interview.questions[questionIndex];
        
        // Use original chatSession for evaluation
        const evaluationPrompt = `You are an expert interview evaluator. Analyze the following interview response and provide detailed feedback.

Question: ${question.question}
User's Answer: ${userResponse}
Job Role: ${interview.jobRole}
Experience Level: ${interview.experience} years

Evaluation Criteria:
1. Technical Accuracy (if applicable)
2. Communication Clarity
3. Problem-Solving Approach
4. Confidence and Presentation
5. Relevance to the Question
6. Completeness of Response

Provide feedback in this JSON format:
{
  "rating": 4,
  "feedback": "Detailed feedback explaining the rating and areas for improvement",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "scoreBreakdown": {
    "technicalAccuracy": 4,
    "communication": 3,
    "problemSolving": 4,
    "confidence": 4,
    "relevance": 5
  }
}

Rating scale: 1-5 (1=poor, 2=below average, 3=average, 4=good, 5=excellent)`;

        const result = await chatSession.sendMessage(evaluationPrompt);
        const responseText = await result.response.text();
        const cleanText = responseText.replace('```json', '').replace('```', '').trim();
        const evaluation = JSON.parse(cleanText);

        // Update question with evaluation results, ensuring all required fields are present
        question.userResponse = userResponse;
        question.feedback = evaluation.feedback;
        question.rating = evaluation.rating;
        question.strengths = evaluation.strengths || [];
        question.weaknesses = evaluation.weaknesses || [];
        question.suggestions = evaluation.suggestions || [];
        question.scoreBreakdown = evaluation.scoreBreakdown || {};

        // Ensure required fields are present for the enhanced schema
        if (!question.category) question.category = 'general';
        if (!question.difficulty) question.difficulty = 'medium';
        if (!question.hints) question.hints = [];
        if (!question.keywords) question.keywords = [];
        if (!question.expectedDuration) question.expectedDuration = 180;

        interview.markModified('questions');
        await interview.save({ validateBeforeSave: true });

        return Response.json({
            success: true,
            message: "Answer evaluated successfully",
            evaluation,
            updatedScore: interview.score,
            analytics: interview.analytics
        }, {status: 200});
    } catch (error) {
        console.error('Error evaluating answer:', error);
        return Response.json({
            success: false,
            message: "Failed to evaluate answer",
            error: error.message
        }, {status: 500});
    }
}