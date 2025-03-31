import User from "@/models/userSchema";
import dbConnect from "@/utils/db";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { serialize } from "cookie";

export async function POST(request) {
    try {
        await dbConnect();
        const {email,password} = await request.json();
        if(!email || !password){
            return Response.json({message: "All fields are required"}, {status: 400});
        }
        const user = await User.findOne({email});
        if(!user){
            return Response.json({message: "User not found"}, {status: 404});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return Response.json({message: "Invalid credentials"}, {status: 400});
        }
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});

        const cookie = serialize('token', token, {
                    secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
                    sameSite: 'strict',
                    path: '/',
                    maxAge:24 * 60 * 60, // 1 day
                  });
              
                  // Set cookie header
                  return new Response(
                    JSON.stringify({
                      message: 'Logged in successfully!',
                      user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                      },
                    }),
                    {
                      status: 201,
                      headers: {
                        'Set-Cookie': cookie,
                        'Content-Type': 'application/json',
                      },
                    }
                  );
    } catch (error) {
        console.log(error);
        return Response.json({message: "Internal server error"}, {status: 500});
    }
}