import dbConnect from '@/utils/db';
import Document from '@/models/documentSchema';
import jwt from 'jsonwebtoken';

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

// GET — Fetch user's uploaded documents
export async function GET(request) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const documents = await Document.find(
            { userId, documentType: 'resume' },
            { chunks: 0 } // Exclude chunks from listing (they contain large embedding arrays)
        ).sort({ createdAt: -1 });

        return Response.json({
            success: true,
            documents: documents.map(doc => ({
                id: doc._id,
                fileName: doc.fileName,
                documentType: doc.documentType,
                rawText: doc.rawText,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            }))
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching documents:', error);
        return Response.json({
            success: false,
            message: 'Failed to fetch documents',
            error: error.message
        }, { status: 500 });
    }
}

// DELETE — Remove a document
export async function DELETE(request) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('id');

        if (!documentId) {
            return Response.json({ success: false, message: 'Document ID required' }, { status: 400 });
        }

        const result = await Document.findOneAndDelete({ _id: documentId, userId });

        if (!result) {
            return Response.json({ success: false, message: 'Document not found' }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: 'Document deleted successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('Error deleting document:', error);
        return Response.json({
            success: false,
            message: 'Failed to delete document',
            error: error.message
        }, { status: 500 });
    }
}
