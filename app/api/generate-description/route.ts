import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, productCategory, keyFeatures, targetAudience, uniqueSellingPoints } = body;

    if (!productName || !keyFeatures) {
      return NextResponse.json(
        { error: 'Product name and key features are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build the prompt
    const prompt = `You are an expert e-commerce copywriter specializing in SEO-optimized product descriptions that drive conversions.

Create an SEO-optimized product description for an e-commerce listing on platforms like Amazon, eBay, or Shopify.

Product Information:
- Product Name: ${productName}
${productCategory ? `- Category: ${productCategory}` : ''}
- Key Features: ${keyFeatures}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${uniqueSellingPoints ? `- Unique Selling Points: ${uniqueSellingPoints}` : ''}

Requirements:
1. Write a compelling, SEO-friendly description (150-200 words)
2. Include relevant keywords naturally
3. Highlight benefits, not just features
4. Use persuasive language that converts browsers to buyers
5. Structure with short paragraphs for readability
6. End with a call-to-action

Write ONLY the product description, no additional commentary.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text().trim();

    if (!description) {
      return NextResponse.json(
        { error: 'Failed to generate description' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      description,
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate description' },
      { status: 500 }
    );
  }
}
