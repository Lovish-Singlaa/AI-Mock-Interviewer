import { chatSession } from '@/utils/GeminiAIModal';
import { buildRAGContext } from '@/utils/embeddings';
import Document from '@/models/documentSchema';
import dbConnect from '@/utils/db';

function normalizeDifficulty(selectedDifficulty) {
    if (selectedDifficulty === 'beginner') return 'easy';
    if (selectedDifficulty === 'intermediate') return 'medium';
    return 'hard';
}

function normalizeQuestionCategory(category) {
    const value = `${category || ''}`.toLowerCase();

    if (value === 'technical') return 'technical';
    if (value === 'behavioral') return 'behavioral';
    if (value === 'leadership') return 'leadership';
    if (value === 'problem-solving' || value === 'problem solving') return 'problem-solving';
    if (value === 'communication') return 'communication';

    // Interview-level categories that are not valid in question enum.
    if (value === 'case-study' || value === 'system-design' || value === 'coding' || value === 'general') {
        return 'technical';
    }

    return 'technical';
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { jobRole, jobDesc, jobExp, selectedCategory, selectedDifficulty, questionCount, userId, useResume } = data;

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

        // ── RAG: Retrieve resume context if enabled ──
        let ragContext = null;
        if (useResume && userId) {
            try {
                await dbConnect();
                const userDoc = await Document.findOne({ userId, documentType: 'resume' });
                if (userDoc && userDoc.chunks && userDoc.chunks.length > 0) {
                    const query = `${jobRole} ${jobDesc} ${jobExp} years experience ${selectedCategory}`;
                    ragContext = await buildRAGContext(query, userDoc.chunks, 5);
                }
            } catch (ragError) {
                console.error('RAG retrieval failed (falling back to standard generation):', ragError);
                // Continue without RAG — don't block question generation
            }
        }

        // ── Build prompt (with or without RAG context) ──
        let prompt = `You are an expert interview coach specializing in ${selectedCategory} interviews. Generate exactly ${questionCount} high-quality interview questions for a ${jobRole} position.

Job Details:
- Role: ${jobRole}
- Description: ${jobDesc}
- Experience Level: ${jobExp} years
- Category: ${selectedCategory}
- Difficulty: ${selectedDifficulty}
`;

        if (ragContext) {
            prompt += `
CANDIDATE RESUME CONTEXT (use this to personalize questions):
---
${ragContext}
---

Requirements:
1. Generate exactly ${questionCount} questions — no more, no less
2. At least 40% of questions should reference specific details from the candidate's resume (their projects, skills, past roles, or achievements)
3. The remaining questions should be role-specific and industry-standard
4. For resume-based questions, probe deeper into the candidate's claimed experience
5. Provide detailed model answers for each question
6. Questions should be realistic and match the ${selectedDifficulty} difficulty level
7. Consider the candidate's experience level (${jobExp} years)`;
        } else {
            prompt += `
Requirements:
1. Generate exactly ${questionCount} questions — no more, no less
2. Questions should be specific to the role and experience level
3. Include a mix of technical, behavioral, and situational questions
4. Provide detailed model answers for each question
5. Questions should be realistic and industry-standard
6. Consider the candidate's experience level (${jobExp} years)`;
        }

        prompt += `

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
            category: normalizeQuestionCategory(q.category || selectedCategory),
            difficulty: normalizeDifficulty(selectedDifficulty),
            hints: [],
            keywords: [],
            expectedDuration: 180
        }));

        return new Response(JSON.stringify({
            success: true,
            questions: enhancedQuestions,
            ragUsed: !!ragContext,
            message: ragContext 
                ? "Personalized questions generated from your resume!" 
                : "Questions generated successfully"
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
