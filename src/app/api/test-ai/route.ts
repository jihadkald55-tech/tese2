import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'No API key' 
      });
    }

    console.log('Testing Gemini 2.5 Flash...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent('قل "مرحباً، أنا أعمل بشكل صحيح!"');
    const response = result.response;
    const text = response.text();
    
    return NextResponse.json({
      success: true,
      model: 'gemini-2.5-flash',
      response: text,
      length: text.length
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack?.substring(0, 300)
    }, { status: 500 });
  }
}
