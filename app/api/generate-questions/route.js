import { chatSession } from '@/utils/GeminiAIModal';

export async function POST(request) {
    try {
        const data = await request.json();
        const { jobRole, jobDesc, jobExp, selectedCategory, selectedDifficulty, questionCount } = data;

        // Validate required fields
        if (!jobRole || !jobDesc || !jobExp) {
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

        // Enhanced prompt for Gemini
        const prompt = `You are an expert interview coach specializing in ${selectedCategory} interviews. Generate ${questionCount} high-quality interview questions for a ${jobRole} position.

Job Details:
- Role: ${jobRole}
- Description: ${jobDesc}
- Experience Level: ${jobExp} years
- Category: ${selectedCategory}
- Difficulty: ${selectedDifficulty}

Requirements:
1. Questions should be specific to the role and experience level
2. Include a mix of technical, behavioral, and situational questions
3. Provide detailed model answers for each question
4. Questions should be realistic and industry-standard
5. Consider the candidate's experience level (${jobExp} years)

Return the response in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "answer": "Comprehensive model answer here"
    }
  ]
}`;

        // Call Gemini AI
        const result = await chatSession.sendMessage(prompt);
        const responseText = await result.response.text();
        
        // Clean and parse JSON
        let cleanText = responseText
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '')
            .replace(/```js\s*/g, '')
            .replace(/```javascript\s*/g, '')
            .trim();
        
        // Try to find JSON object in the response
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanText = jsonMatch[0];
        }
        
        const jsonResp = JSON.parse(cleanText);

        // Validate the response structure
        if (!jsonResp || !jsonResp.questions || !Array.isArray(jsonResp.questions)) {
            throw new Error('Invalid response structure from AI');
        }

        // Map the AI-generated questions to the enhanced schema
        const enhancedQuestions = jsonResp.questions.map(q => ({
            question: q.question || "Sample question",
            answer: q.answer || "Sample answer",
            userResponse: '',
            feedback: '',
            rating: 0,
            timeSpent: 0,
            category: selectedCategory,
            difficulty: selectedDifficulty === 'beginner' ? 'easy' : selectedDifficulty === 'intermediate' ? 'medium' : 'hard',
            hints: [],
            keywords: [],
            expectedDuration: 180
        }));

        return new Response(JSON.stringify({
            success: true,
            questions: enhancedQuestions,
            message: "Questions generated successfully"
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Question Generation Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            message: "Failed to generate questions. Please try again."
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

