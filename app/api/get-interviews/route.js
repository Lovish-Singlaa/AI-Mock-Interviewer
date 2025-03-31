import User from "@/models/userSchema";
import Interview from "@/models/interviewSchema";
import jwt from "jsonwebtoken";
import dbConnect from "@/utils/db";

export async function GET(request) {
    await dbConnect();
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return new Response("Unauthorized: No token found", { status: 401 });
    }

    // Verify token and extract userId
    const secretKey = process.env.JWT_SECRET;
    let decoded;
    try {
        decoded = jwt.verify(token, secretKey);
    } catch (error) {
        console.log("Error verifying token:", error);
        
        return new Response("Unauthorized: Invalid token", { status: 401 });
    }

    const userId = decoded.userId;

    if (!userId) {
        console.log("User ID not found in token");
        return new Response("Unauthorized: Invalid token", { status: 401 });
    }

    const user = await User.findById(userId).populate('interviews');
    if(!user){
        return new Response("User not found", {status: 404})
    }
    return new Response(JSON.stringify(user.interviews), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}