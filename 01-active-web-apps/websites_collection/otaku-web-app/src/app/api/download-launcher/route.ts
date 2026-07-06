import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Check authorization: User must have the early access cookie
    const cookieStore = await cookies();
    const hasEarlyAccess = cookieStore.has('early_access_unlocked');

    if (!hasEarlyAccess) {
      return NextResponse.json({ error: 'Unauthorized. You must purchase early access to download the launcher.' }, { status: 403 });
    }

    const filePath = path.join(process.cwd(), 'storage', 'private', 'launcher.zip');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Launcher file not found. Please contact support.' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="OtakuLauncher.zip"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
