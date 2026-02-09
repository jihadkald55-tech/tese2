import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'لا يوجد',
    nodeEnv: process.env.NODE_ENV
  });
}
