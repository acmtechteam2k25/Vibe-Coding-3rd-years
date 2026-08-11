import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const imageUrls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `property_${Date.now()}_${Math.random().toString(36).substring(7)}.${file.name.split('.').pop() || 'jpg'}`;

      try {
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, buffer, {
            contentType: file.type || 'image/jpeg',
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(data.path);
          
          if (publicUrlData.publicUrl) {
            imageUrls.push(publicUrlData.publicUrl);
            continue;
          }
        }
      } catch (e) {
        console.warn('Supabase storage upload failed, utilizing fallback data URL:', e);
      }

      // Fallback data URL encoding if Supabase storage credentials aren't active
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type || 'image/jpeg'};base64,${base64}`;
      imageUrls.push(dataUrl);
    }

    return NextResponse.json({ urls: imageUrls });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
}
