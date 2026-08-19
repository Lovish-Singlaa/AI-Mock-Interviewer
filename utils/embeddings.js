const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

/**
 * Generate a 768-dim embedding vector for a given text using Gemini text-embedding-004.
 */
export async function getEmbedding(text) {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
}

/**
 * Split text into overlapping chunks for better retrieval.
 * Uses paragraph boundaries when possible, falls back to character-level splitting.
 */
export function chunkText(text, chunkSize = 800, overlap = 200) {
    if (!text || text.length === 0) return [];

    // Clean the text
    const cleaned = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    // Split by paragraphs first
    const paragraphs = cleaned.split(/\n\n+/);
    const chunks = [];
    let currentChunk = '';

    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;

        if ((currentChunk + '\n\n' + trimmed).length > chunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            // Keep overlap from the end of the current chunk
            const overlapText = currentChunk.slice(-overlap);
            currentChunk = overlapText + '\n\n' + trimmed;
        } else {
            currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
        }
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    // If we only got one chunk (dense text with no paragraph breaks), split by sentences
    if (chunks.length === 1 && chunks[0].length > chunkSize * 1.5) {
        const sentences = chunks[0].split(/(?<=[.!?])\s+/);
        const sentenceChunks = [];
        let current = '';

        for (const sentence of sentences) {
            if ((current + ' ' + sentence).length > chunkSize && current.length > 0) {
                sentenceChunks.push(current.trim());
                const overlapText = current.slice(-overlap);
                current = overlapText + ' ' + sentence;
            } else {
                current = current ? current + ' ' + sentence : sentence;
            }
        }
        if (current.trim().length > 0) {
            sentenceChunks.push(current.trim());
        }
        return sentenceChunks;
    }

    return chunks;
}

/**
 * Compute cosine similarity between two vectors.
 */
export function cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Search for the most relevant chunks given a query embedding.
 * Uses in-memory cosine similarity (works on all MongoDB tiers).
 */
export function searchSimilarChunks(queryEmbedding, chunks, topK = 5) {
    const scored = chunks
        .filter(chunk => chunk.embedding && chunk.embedding.length > 0)
        .map(chunk => ({
            content: chunk.content,
            metadata: chunk.metadata,
            score: cosineSimilarity(queryEmbedding, chunk.embedding)
        }))
        .sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
}

/**
 * Classify a text chunk into a resume section category using keyword heuristics.
 */
export function classifySection(text) {
    const lower = text.toLowerCase();

    if (/\b(experience|worked|work|developed|built|led|managed|implemented|engineered|company|corp|inc|ltd)\b/.test(lower)) {
        return 'work_experience';
    }
    if (/\b(education|university|college|degree|bachelor|master|phd|gpa|graduated|certification|certified)\b/.test(lower)) {
        return 'education';
    }
    if (/\b(project|github|portfolio|hackathon|built a|created a|developed a)\b/.test(lower)) {
        return 'projects';
    }
    if (/\b(skill|proficient|technologies|tech stack|languages|frameworks|tools|python|java|react|node|sql)\b/.test(lower)) {
        return 'skills';
    }
    if (/\b(award|achievement|honor|recognition|patent|publication|published)\b/.test(lower)) {
        return 'achievements';
    }
    return 'other';
}

/**
 * Build the RAG context string to inject into a Gemini prompt.
 * Retrieves top-K relevant resume chunks for a given query.
 */
export async function buildRAGContext(queryText, documentChunks, topK = 5) {
    if (!documentChunks || documentChunks.length === 0) return null;

    const queryEmbedding = await getEmbedding(queryText);
    const relevant = searchSimilarChunks(queryEmbedding, documentChunks, topK);

    if (relevant.length === 0) return null;

    const contextLines = relevant.map((chunk, i) => 
        `[Resume Excerpt ${i + 1}] (${chunk.metadata?.section || 'general'}, relevance: ${(chunk.score * 100).toFixed(0)}%):\n${chunk.content}`
    );

    return contextLines.join('\n\n');
}
