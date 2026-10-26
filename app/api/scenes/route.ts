import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, generateId } from '@/lib/storage';
import { Scene } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const chapterId = searchParams.get('chapterId');
    
    const scenes = readJsonFile<Scene>('scenes.json');
    
    let filtered = scenes;
    if (bookId) {
      filtered = filtered.filter(s => s.bookId === bookId);
    }
    if (chapterId) {
      filtered = filtered.filter(s => s.chapterId === chapterId);
    }
    
    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read scenes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scenes = readJsonFile<Scene>('scenes.json');
    
    const newScene: Scene = {
      id: generateId(),
      bookId: body.bookId,
      chapterId: body.chapterId,
      title: body.title,
      description: body.description || '',
      characterIds: body.characterIds || [],
      environmentId: body.environmentId,
      cameraShotType: body.cameraShotType || '',
      dialogue: body.dialogue || '',
      estimatedLength: body.estimatedLength || 0,
      status: body.status || 'scripted',
      order: scenes.length,
    };
    
    scenes.push(newScene);
    writeJsonFile('scenes.json', scenes);
    
    return NextResponse.json(newScene, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create scene' }, { status: 500 });
  }
}
