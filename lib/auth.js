import jwt from 'jsonwebtoken';

export const getUserFromCookie = (request) => {
  try {
    const cookie = request.headers.get('cookie');

    if (!cookie) return null;

    const token = cookie
      .split('; ')
      .find((c) => c.startsWith('token='))
      ?.split('=')[1];

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);

    return decoded.userId;
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
};
