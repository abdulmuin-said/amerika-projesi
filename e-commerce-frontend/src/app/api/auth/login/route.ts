import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch(`${process.env.SERVER_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok)
    return NextResponse.json({ error: (await response.json()).message }, { status: 401 });

  const data = await response.json();

  const cookieStore = await cookies();
  const maxAge = (data.expiresAt - Date.now()) / 1000;

  cookieStore.set({
    name: 'token',
    value: data.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  if (data.user?.roleName) {
    cookieStore.set({
      name: 'user_role',
      value: data.user.roleName,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });
  }

  return NextResponse.json(data);
}
