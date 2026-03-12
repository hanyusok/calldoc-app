import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    
    // Safety check against directory traversal
    if (path.some(p => p.includes('..'))) {
        return new NextResponse('Bad Request', { status: 400 });
    }

    const filePath = join(process.cwd(), 'public/images/posts', ...path);

    if (!existsSync(filePath)) {
        return new NextResponse('Not found', { status: 404 });
    }

    try {
        const fileBuffer = await readFile(filePath);
        const extension = filePath.split('.').pop()?.toLowerCase();
        
        let contentType = 'image/jpeg';
        if (extension === 'png') contentType = 'image/png';
        else if (extension === 'gif') contentType = 'image/gif';
        else if (extension === 'webp') contentType = 'image/webp';
        else if (extension === 'svg') contentType = 'image/svg+xml';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
