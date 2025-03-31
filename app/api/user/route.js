import { getUserFromCookie } from "@/lib/auth";
import User from "@/models/userSchema";
import dbConnect from "@/utils/db";
import jwt from 'jsonwebtoken';

export async function GET(request) {
    try {
      const cookie = request.headers.get('cookie');
      if (!cookie) return new Response('Unauthorized', { status: 401 });
  
      const token = cookie
        .split('; ')
        .find((c) => c.startsWith('token='))
        ?.split('=')[1];
  
      if (!token) return new Response('Unauthorized', { status: 401 });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      const user = await User.findById(userId)
      if(!user){
        return new Response(JSON.stringify({ message: "User not found!" }), { status: 401 });
      }
      return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (error) {
    return Response.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
