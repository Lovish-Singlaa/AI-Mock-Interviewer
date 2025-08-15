const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
// Multiple models for different use cases
const models = {
    standard: genAI.getGenerativeModel({ model: "gemini-2.0-flash" }),
    advanced: genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }),
    creative: genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
};
  
  const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

export const chatSession = models.standard.startChat({
    generationConfig,
    safetySettings
});

// Enhanced prompt templates
export const promptTemplates = {
    generateQuestions: (jobRole, jobDesc, experience, category, difficulty, questionCount) => `
You are an expert interview coach specializing in ${category} interviews. Generate ${questionCount} high-quality interview questions for a ${jobRole} position.

Job Details:
- Role: ${jobRole}
- Description: ${jobDesc}
- Experience Level: ${experience} years
- Category: ${category}
- Difficulty: ${difficulty}

Requirements:
1. Questions should be specific to the role and experience level
2. Include a mix of technical, behavioral, and situational questions
3. Provide detailed model answers for each question
4. Questions should be realistic and industry-standard
5. Consider the candidate's experience level (${experience} years)

For each question, provide:
- Question text
- Expected answer (comprehensive and well-structured)
- Question category (technical/behavioral/leadership/problem-solving/communication)
- Difficulty level (easy/medium/hard)
- Expected duration (in seconds)
- Key points the answer should cover

Return the response in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "answer": "Comprehensive model answer here",
      "category": "technical|behavioral|leadership|problem-solving|communication",
      "difficulty": "easy|medium|hard",
      "expectedDuration": 180,
      "keyPoints": ["point1", "point2", "point3"]
    }
  ]
}
`,

    evaluateAnswer: (question, userAnswer, jobRole, experience) => `
You are an expert interview evaluator. Analyze the following interview response and provide detailed feedback.

Question: ${question}
User's Answer: ${userAnswer}
Job Role: ${jobRole}
Experience Level: ${experience} years

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

Rating scale: 1-5 (1=poor, 2=below average, 3=average, 4=good, 5=excellent)
`,

    generateFollowUp: (originalQuestion, userAnswer, rating) => `
Based on the user's response to the previous question, generate a relevant follow-up question that will help them improve.

Original Question: ${originalQuestion}
User's Answer: ${userAnswer}
Previous Rating: ${rating}/5

Generate a follow-up question that:
1. Addresses any gaps in their previous answer
2. Builds upon their response
3. Challenges them to think deeper
4. Is appropriate for their skill level

Return only the follow-up question text.
`,

    provideTips: (category, difficulty) => `
You are an interview preparation expert. Provide 3-5 specific tips for ${category} interviews at ${difficulty} level.

Focus on:
- Common mistakes to avoid
- Best practices for this category
- Specific techniques for ${difficulty} level
- How to structure responses effectively

Return tips in a clear, actionable format.
`,

    analyzePerformance: (interviewData) => `
Analyze the following interview performance data and provide comprehensive insights.

Interview Data: ${JSON.stringify(interviewData)}

Provide analysis in this JSON format:
{
  "overallAssessment": "Overall performance summary",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvementAreas": ["area1", "area2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "nextSteps": ["step1", "step2"],
  "confidenceLevel": 75,
  "readinessScore": 80
}
`
};

// Enhanced AI service functions
export const aiService = {
    async generateQuestions(jobRole, jobDesc, experience, category = 'general', difficulty = 'intermediate', questionCount = 5) {
        try {
            const prompt = promptTemplates.generateQuestions(jobRole, jobDesc, experience, category, difficulty, questionCount);
            const result = await chatSession.sendMessage(prompt);
            const responseText = await result.response.text();
            const cleanText = responseText.replace('```json', '').replace('```', '').trim();
            return JSON.parse(cleanText);
        } catch (error) {
            console.error('Error generating questions:', error);
            throw new Error('Failed to generate interview questions');
        }
    },

    async evaluateAnswer(question, userAnswer, jobRole, experience) {
        try {
            const prompt = promptTemplates.evaluateAnswer(question, userAnswer, jobRole, experience);
            const result = await chatSession.sendMessage(prompt);
            const responseText = await result.response.text();
            const cleanText = responseText.replace('```json', '').replace('```', '').trim();
            return JSON.parse(cleanText);
        } catch (error) {
            console.error('Error evaluating answer:', error);
            throw new Error('Failed to evaluate answer');
        }
    },

    async generateFollowUp(originalQuestion, userAnswer, rating) {
        try {
            const prompt = promptTemplates.generateFollowUp(originalQuestion, userAnswer, rating);
            const result = await chatSession.sendMessage(prompt);
            return await result.response.text();
        } catch (error) {
            console.error('Error generating follow-up:', error);
            throw new Error('Failed to generate follow-up question');
        }
    },

    async provideTips(category, difficulty) {
        try {
            const prompt = promptTemplates.provideTips(category, difficulty);
            const result = await chatSession.sendMessage(prompt);
            return await result.response.text();
        } catch (error) {
            console.error('Error providing tips:', error);
            throw new Error('Failed to provide tips');
        }
    },

    async analyzePerformance(interviewData) {
        try {
            const prompt = promptTemplates.analyzePerformance(interviewData);
            const result = await chatSession.sendMessage(prompt);
            const responseText = await result.response.text();
            const cleanText = responseText.replace('```json', '').replace('```', '').trim();
            return JSON.parse(cleanText);
        } catch (error) {
            console.error('Error analyzing performance:', error);
            throw new Error('Failed to analyze performance');
        }
    }
};

// Interview categories and their descriptions
export const interviewCategories = {
    technical: {
        name: 'Technical Interview',
        description: 'Focus on technical skills, problem-solving, and coding abilities',
        icon: '💻',
        color: 'blue'
    },
    behavioral: {
        name: 'Behavioral Interview',
        description: 'Assess soft skills, past experiences, and cultural fit',
        icon: '🤝',
        color: 'green'
    },
    leadership: {
        name: 'Leadership Interview',
        description: 'Evaluate leadership potential and management skills',
        icon: '👑',
        color: 'purple'
    },
    'case-study': {
        name: 'Case Study Interview',
        description: 'Problem-solving scenarios and business analysis',
        icon: '📊',
        color: 'orange'
    },
    'system-design': {
        name: 'System Design Interview',
        description: 'Architecture and system design challenges',
        icon: '🏗️',
        color: 'red'
    },
    coding: {
        name: 'Coding Interview',
        description: 'Programming challenges and algorithm problems',
        icon: '⚡',
        color: 'yellow'
    },
    general: {
        name: 'General Interview',
        description: 'Mixed questions covering various aspects',
        icon: '🎯',
        color: 'gray'
    }
};

// Difficulty levels
export const difficultyLevels = {
    beginner: {
        name: 'Beginner',
        description: 'Suitable for entry-level positions and new graduates',
        color: 'green'
    },
    intermediate: {
        name: 'Intermediate',
        description: 'For professionals with 2-5 years of experience',
        color: 'yellow'
    },
    advanced: {
        name: 'Advanced',
        description: 'For senior positions and experienced professionals',
        color: 'red'
    }
};