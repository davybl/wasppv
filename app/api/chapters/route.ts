import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, generateId } from '@/lib/storage';
import { Chapter } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    
    const chapters = readJsonFile<Chapter>('chapters.json');
    
    if (bookId) {
      const filtered = chapters.filter(c => c.bookId === bookId);
      return NextResponse.json(filtered);
    }
    
    return NextResponse.json(chapters);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read chapters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const chapters = readJsonFile<Chapter>('chapters.json');
    
    const newChapter: Chapter = {
      id: generateId(),
      bookId: body.bookId,
      chapterNumber: body.chapterNumber,
      title: body.title,
      content: body.content || '',
      status: body.status || 'draft',
      order: chapters.length,
      wordCount: 0,
      characterCount: 0,
    };
    
    chapters.push(newChapter);
    writeJsonFile('chapters.json', chapters);
    
    return NextResponse.json(newChapter, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}
