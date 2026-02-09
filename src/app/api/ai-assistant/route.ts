import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // التحقق من وجود API key أولاً
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === '') {
      return NextResponse.json({ 
        success: false, 
        error: 'يرجى إضافة Google Gemini API Key في ملف .env.local',
        needsApiKey: true
      }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { prompt, action, text } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        error: 'النص فارغ. الرجاء تحديد نص أولاً.'
      }, { status: 400 });
    }

    // نموذج Gemini المجاني - استخدام أحدث نموذج متاح
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let fullPrompt = '';

    switch (action) {
      case 'improve':
        fullPrompt = `أنت مساعد أكاديمي متخصص في تحسين النصوص البحثية. 
حسّن النص التالي من الناحية اللغوية والأكاديمية مع الحفاظ على المعنى:

${text}

قدم نسخة محسنة فقط بدون شرح.`;
        break;

      case 'rephrase':
        fullPrompt = `أعد صياغة النص التالي بأسلوب أكاديمي احترافي:

${text}

قدم النص المعاد صياغته فقط بدون شرح.`;
        break;

      case 'summarize':
        fullPrompt = `لخص النص التالي بشكل موجز ومفيد:

${text}

قدم الملخص فقط بدون مقدمات.`;
        break;

      case 'expand':
        fullPrompt = `وسّع الفكرة التالية بشكل أكاديمي مع إضافة تفاصيل وأمثلة:

${text}

قدم النص الموسع فقط.`;
        break;

      case 'grammar':
        fullPrompt = `صحح الأخطاء اللغوية والنحوية في النص التالي:

${text}

قدم النص المصحح فقط.`;
        break;

      case 'suggest':
        fullPrompt = `اقترح 3 أفكار لتطوير أو إضافة للنص التالي:

${text}

قدم الاقتراحات في نقاط واضحة.`;
        break;

      default:
        fullPrompt = prompt || text;
    }

    console.log('Generating AI content with prompt length:', fullPrompt.length);
    console.log('Using model: gemini-1.5-flash');
    
    const result = await model.generateContent(fullPrompt);
    console.log('Generation complete, extracting response...');
    
    const response = result.response;
    const generatedText = response.text();
    
    console.log('Response text length:', generatedText.length);

    return NextResponse.json({ 
      success: true, 
      text: generatedText 
    });

  } catch (error: any) {
    console.error('AI Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // تحليل نوع الخطأ
    const errorMessage = error.message || '';
    
    // إذا كان الخطأ متعلق بـ API key
    if (errorMessage.includes('API') && (errorMessage.includes('key') || errorMessage.includes('KEY'))) {
      return NextResponse.json({ 
        success: false, 
        error: 'مفتاح API غير صحيح. تأكد من صحة المفتاح في ملف .env.local',
        needsApiKey: true
      }, { status: 401 });
    }

    // إذا كان الخطأ متعلق بالحصة
    if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('exhausted')) {
      return NextResponse.json({ 
        success: false, 
        error: 'تم تجاوز الحد المجاني. انتظر قليلاً وحاول مرة أخرى.'
      }, { status: 429 });
    }

    // أخطاء أخرى
    return NextResponse.json({ 
      success: false, 
      error: `حدث خطأ: ${errorMessage || 'خطأ غير معروف'}`
    }, { status: 500 });
  }
}
