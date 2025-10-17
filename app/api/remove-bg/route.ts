import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Remove.bg API key not configured' },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Sending request to remove.bg API...');
    
    // Create form data for remove.bg API
    const removeBgFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    
    // Ensure we're using the correct field name and file name
    const fileName = file.name || 'image.png';
    removeBgFormData.append('image_file', blob, fileName);
    removeBgFormData.append('size', 'auto');

    // Add debug logging
    console.log('File info:', {
      fileName,
      fileType: file.type,
      fileSize: file.size,
      bufferSize: buffer.byteLength
    });

    // Call remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: removeBgFormData as any, // Type assertion to bypass TypeScript error
    });
    
    console.log('Remove.bg API response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Background removal failed';
      try {
        const errorData = await response.text();
        console.error('Remove.bg API error:', errorData);
        const jsonError = JSON.parse(errorData);
        errorMessage = jsonError.errors?.[0]?.title || errorData;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Get the processed image
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;
    
    console.log('Successfully processed image. Image size:', base64Image.length, 'bytes');

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Background removed successfully',
    });
  } catch (error) {
    console.error('Remove.bg API error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
