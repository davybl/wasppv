import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/storage';
import { Character } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const characters = readJsonFile<Character>('characters.json');

    const index = characters.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    characters[index] = { ...characters[index], ...body };
    writeJsonFile('characters.json', characters);

    return NextResponse.json(characters[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const characters = readJsonFile<Character>('characters.json');

    const index = characters.findIndex(c => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    characters.splice(index, 1);
    writeJsonFile('characters.json', characters);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}
