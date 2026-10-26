import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/storage';
import { Scene } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const scenes = readJsonFile<Scene>('scenes.json');

    const index = scenes.findIndex(s => s.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    scenes[index] = { ...scenes[index], ...body };
    writeJsonFile('scenes.json', scenes);

    return NextResponse.json(scenes[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update scene' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scenes = readJsonFile<Scene>('scenes.json');

    const index = scenes.findIndex(s => s.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    scenes.splice(index, 1);
    writeJsonFile('scenes.json', scenes);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete scene' }, { status: 500 });
  }
}
