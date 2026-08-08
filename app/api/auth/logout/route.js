import { serialize } from "cookie";

export async function POST() {
    const cookie = serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });

    return new Response(
        JSON.stringify({ message: 'Logged out successfully' }),
        {
            status: 200,
            headers: {
                'Set-Cookie': cookie,
                'Content-Type': 'application/json',
            },
        }
    );
}
