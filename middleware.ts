import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

    const username = process.env.ADMIN_USER!;
    const password = process.env.ADMIN_PASS!;

  const validAuth =
    'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

  if (authHeader === validAuth) {
    return NextResponse.next();
  }

  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

// 👇 IMPORTANT: només protegim /admin
export const config = {
  matcher: ['/admin/:path*'],
};