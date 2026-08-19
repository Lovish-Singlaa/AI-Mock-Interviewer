import dbConnect from '@/utils/db';
import Document from '@/models/documentSchema';
import { chunkText, getEmbedding, classifySection } from '@/utils/embeddings';
import jwt from 'jsonwebtoken';
import { PDFParse } from 'pdf-parse';

function getUserIdFromRequest(request) {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.userId;
    } catch {
        return null;
    }
}

export async function POST(request) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return Response.json({ success: false, message: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            return Response.json({ success: false, message: 'Only PDF files are supported' }, { status: 400 });
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return Response.json({ success: false, message: 'File size must be under 5MB' }, { status: 400 });
        }

        // Delete any existing resume for this user (one resume per user)
        await Document.deleteMany({ userId, documentType: 'resume' });

        // Extract text from PDF using pdf-parse v2 API
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        const rawText = pdfData.text;
        await parser.destroy();

        if (!rawText || rawText.trim().length < 50) {
            return Response.json({ 
                success: false, 
                message: 'Could not extract meaningful text from the PDF. Ensure it is not image-based.' 
            }, { status: 400 });
        }

        // Chunk the text
        const textChunks = chunkText(rawText, 800, 200);

        // Generate embeddings for each chunk
        const chunks = [];
        for (const content of textChunks) {
            const embedding = await getEmbedding(content);
            const section = classifySection(content);
            chunks.push({
                content,
                embedding,
                metadata: {
                    page: 1,
                    section
                }
            });
        }

        // Store in MongoDB
        const document = await Document.create({
            userId,
            fileName: file.name,
            documentType: 'resume',
            chunks,
            rawText
        });

        return Response.json({
            success: true,
            message: 'Resume uploaded and processed successfully',
            document: {
                id: document._id,
                fileName: document.fileName,
                chunksCount: chunks.length,
                sections: [...new Set(chunks.map(c => c.metadata.section))]
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Resume upload error:', error);
        return Response.json({
            success: false,
            message: 'Failed to process resume',
            error: error.message
        }, { status: 500 });
    }
}
