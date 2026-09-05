import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { path, method = 'GET', body } = await req.json();
  const token = (await cookies()).get('token')?.value;

  const res = await axios({
    method,
    url: `${process.env.SERVER_URL}${path}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'identity'
    },
    data: body
  }).catch((err) => {
    return err.response;
  });

  const headers = new Headers();

  if (res && res.headers) {
    for (const [key, value] of Object.entries(res.headers)) {
      if (typeof value === 'string') {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(','));
      }
    }
  }


  if (!res) {
    return new NextResponse(JSON.stringify({ message: 'Backend unreachable' }), {
      status: 503,
      headers,
    });
  }

  if (res.status === 204) {
    return new NextResponse(null, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  }

  return new NextResponse(JSON.stringify(res.data), {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
};
