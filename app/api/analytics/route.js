import User from '@/models/userSchema';
import Interview from '@/models/interviewSchema';
import dbConnect from '@/utils/db';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return new Response(JSON.stringify({
                success: false,
                message: "User ID is required"
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Get user data
        const user = await User.findById(userId);
        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: "User not found"
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Get user's interviews
        const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });

        // Calculate comprehensive analytics
        const analytics = {
            overview: {
                totalInterviews: interviews.length,
                completedInterviews: interviews.filter(i => i.score > 0).length,
                averageScore: 0,
                bestScore: 0,
                totalPracticeTime: interviews.length * 30, // minutes
                improvementRate: 0,
                currentStreak: 0,
                longestStreak: 0
            },
            performance: {
                byCategory: {},
                byDifficulty: {},
                byMonth: {},
                scoreDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
            },
            insights: {
                strengths: [],
                weaknesses: [],
                recommendations: [],
                trends: []
            },
            goals: {
                completed: 0,
                inProgress: 0,
                upcoming: []
            }
        };

        // Calculate basic metrics
        const completedInterviews = interviews.filter(i => i.score > 0);
        if (completedInterviews.length > 0) {
            const totalScores = completedInterviews.reduce((sum, i) => sum + i.score, 0);
            analytics.overview.averageScore = Math.round((totalScores / completedInterviews.length) * 10) / 10;
            analytics.overview.bestScore = Math.max(...completedInterviews.map(i => i.score));

            // Calculate improvement rate
            if (completedInterviews.length > 1) {
                const sortedInterviews = completedInterviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                const firstHalf = sortedInterviews.slice(0, Math.ceil(sortedInterviews.length / 2));
                const secondHalf = sortedInterviews.slice(Math.ceil(sortedInterviews.length / 2));
                
                const firstHalfAvg = firstHalf.reduce((sum, i) => sum + i.score, 0) / firstHalf.length;
                const secondHalfAvg = secondHalf.reduce((sum, i) => sum + i.score, 0) / secondHalf.length;
                
                analytics.overview.improvementRate = Math.round((secondHalfAvg - firstHalfAvg) * 10) / 10;
            }

            // Calculate score distribution
            completedInterviews.forEach(interview => {
                const score = interview.score.toString();
                analytics.performance.scoreDistribution[score]++;
            });

            // Calculate performance by category
            const categoryScores = {};
            completedInterviews.forEach(interview => {
                if (interview.category) {
                    if (!categoryScores[interview.category]) {
                        categoryScores[interview.category] = [];
                    }
                    categoryScores[interview.category].push(interview.score);
                }
            });

            Object.entries(categoryScores).forEach(([category, scores]) => {
                analytics.performance.byCategory[category] = {
                    count: scores.length,
                    averageScore: Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10,
                    bestScore: Math.max(...scores)
                };
            });

            // Calculate performance by difficulty
            const difficultyScores = {};
            completedInterviews.forEach(interview => {
                if (interview.difficulty) {
                    if (!difficultyScores[interview.difficulty]) {
                        difficultyScores[interview.difficulty] = [];
                    }
                    difficultyScores[interview.difficulty].push(interview.score);
                }
            });

            Object.entries(difficultyScores).forEach(([difficulty, scores]) => {
                analytics.performance.byDifficulty[difficulty] = {
                    count: scores.length,
                    averageScore: Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10,
                    bestScore: Math.max(...scores)
                };
            });

            // Calculate monthly trends
            const monthlyScores = {};
            completedInterviews.forEach(interview => {
                const month = new Date(interview.createdAt).toISOString().slice(0, 7); // YYYY-MM
                if (!monthlyScores[month]) {
                    monthlyScores[month] = [];
                }
                monthlyScores[month].push(interview.score);
            });

            Object.entries(monthlyScores).forEach(([month, scores]) => {
                analytics.performance.byMonth[month] = {
                    count: scores.length,
                    averageScore: Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
                };
            });

            // Generate insights
            const strengths = [];
            const weaknesses = [];
            
            Object.entries(analytics.performance.byCategory).forEach(([category, data]) => {
                if (data.averageScore >= 4) {
                    strengths.push(category);
                } else if (data.averageScore <= 2.5) {
                    weaknesses.push(category);
                }
            });

            analytics.insights.strengths = strengths;
            analytics.insights.weaknesses = weaknesses;

            // Generate recommendations
            const recommendations = [];
            if (weaknesses.length > 0) {
                recommendations.push(`Focus on improving your ${weaknesses.join(', ')} skills`);
            }
            if (analytics.overview.averageScore < 3) {
                recommendations.push('Consider practicing more frequently to improve your overall performance');
            }
            if (analytics.overview.improvementRate < 0) {
                recommendations.push('Review your recent interviews to identify areas for improvement');
            }
            if (strengths.length > 0) {
                recommendations.push(`Leverage your strengths in ${strengths.join(', ')} during interviews`);
            }

            analytics.insights.recommendations = recommendations;

            // Calculate streaks
            let currentStreak = 0;
            let longestStreak = 0;
            let tempStreak = 0;
            
            const sortedByDate = completedInterviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            for (let i = 0; i < sortedByDate.length; i++) {
                if (sortedByDate[i].score >= 3) { // Consider 3+ as a successful interview
                    tempStreak++;
                    if (i === 0) currentStreak = tempStreak;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 0;
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);
            
            analytics.overview.currentStreak = currentStreak;
            analytics.overview.longestStreak = longestStreak;
        }

        // Update user analytics in database
        user.analytics = {
            totalInterviews: analytics.overview.totalInterviews,
            completedInterviews: analytics.overview.completedInterviews,
            averageScore: analytics.overview.averageScore,
            totalPracticeTime: analytics.overview.totalPracticeTime,
            streakDays: analytics.overview.currentStreak,
            lastPracticeDate: completedInterviews.length > 0 ? completedInterviews[0].createdAt : null,
            bestScore: analytics.overview.bestScore,
            improvementRate: analytics.overview.improvementRate,
            strengths: analytics.insights.strengths,
            weaknesses: analytics.insights.weaknesses,
            preferredCategories: Object.keys(analytics.performance.byCategory).sort((a, b) => 
                analytics.performance.byCategory[b].count - analytics.performance.byCategory[a].count
            ).slice(0, 3)
        };

        await user.save();

        return new Response(JSON.stringify({
            success: true,
            analytics,
            user: {
                name: user.name,
                email: user.email,
                preferences: user.preferences,
                learningPath: user.learningPath
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Analytics API Error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: "Failed to fetch analytics",
            error: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
