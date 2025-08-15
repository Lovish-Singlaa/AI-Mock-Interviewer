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

        const { jobRole, jobDesc, jobExp, questions, userId, category, difficulty } = data;
        
        // Validate required fields
        if (!jobRole || !jobDesc || !jobExp || !questions || !userId) {
            return new Response(JSON.stringify({
                success: false,
                message: "Missing required fields"
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Create interview with enhanced data
        const interview = await Interview.create({
            jobRole,
            jobDescription: jobDesc,
            experience: jobExp,
            category: category || 'general',
            difficulty: difficulty || 'intermediate',
            questions: questions,
            userId: userId,
            score: 0,
            startTime: new Date(),
            isCompleted: false
        });

        // Update user's interview list
        await User.findByIdAndUpdate(userId, { 
            $push: { interviews: interview._id }
        });

        return new Response(JSON.stringify({
            success: true,
            interviewId: interview._id,
            message: "Interview created successfully"
        }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(
            JSON.stringify({ 
                success: false,
                error: error.message,
                message: "Failed to create interview"
            }), 
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const category = searchParams.get('category');
        const difficulty = searchParams.get('difficulty');
        const limit = parseInt(searchParams.get('limit')) || 10;
        const page = parseInt(searchParams.get('page')) || 1;

        let query = {};
        
        if (userId) {
            query.userId = userId;
        }
        
        if (category) {
            query.category = category;
        }
        
        if (difficulty) {
            query.difficulty = difficulty;
        }

        const skip = (page - 1) * limit;
        
        const interviews = await Interview.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email');

        const total = await Interview.countDocuments(query);

        return new Response(JSON.stringify({
            success: true,
            interviews,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return new Response(
            JSON.stringify({ 
                success: false,
                error: error.message,
                message: "Failed to fetch interviews"
            }), 
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}