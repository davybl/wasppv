import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/storage';
import { Chapter } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const chapters = readJsonFile<Chapter>('chapters.json');

    const index = chapters.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    chapters[index] = { ...chapters[index], ...body };
    writeJsonFile('chapters.json', chapters);

    return NextResponse.json(chapters[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapters = readJsonFile<Chapter>('chapters.json');

    const index = chapters.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    chapters.splice(index, 1);
    writeJsonFile('chapters.json', chapters);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
