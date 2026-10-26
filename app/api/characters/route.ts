import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, generateId } from '@/lib/storage';
import { Character } from '@/lib/types';

export async function GET() {
  try {
    const characters = readJsonFile<Character>('characters.json');
    return NextResponse.json(characters);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read characters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const characters = readJsonFile<Character>('characters.json');
    
    const newCharacter: Character = {
      id: generateId(),
      ...body,
    };
    
    characters.push(newCharacter);
    writeJsonFile('characters.json', characters);
    
    return NextResponse.json(newCharacter, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}
