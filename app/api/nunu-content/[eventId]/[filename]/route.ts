import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface RouteParams {
  params: Promise<{
    eventId: string;
    filename: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { eventId, filename } = await params;

  const filePath = path.join(process.cwd(), 'app', 'data', 'nunu-content', eventId, filename);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch {
    return new NextResponse('File not found', { status: 404 });
  }
}
