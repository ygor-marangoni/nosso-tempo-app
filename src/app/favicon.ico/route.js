import { NextResponse } from 'next/server';

export function GET(request) {
  const target = new URL('/favicon.svg?v=20260402', request.url);
  return NextResponse.redirect(target, 307);
}
