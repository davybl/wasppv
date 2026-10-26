import { NextResponse } from 'next/server';
import { readJsonFile } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const DATA_DIR = path.join(process.cwd(), 'data');

    const characters = readJsonFile('characters.json');
    const models = readJsonFile('models.json');
    const books = readJsonFile('books.json');
    const chapters = readJsonFile('chapters.json');
    const scenes = readJsonFile('scenes.json');

    const allData = {
      characters,
      models,
      books,
      chapters,
      scenes,
      exportDate: new Date().toISOString(),
    };

    return NextResponse.json(allData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { characters, models, books, chapters, scenes } = body;

    const DATA_DIR = path.join(process.cwd(), 'data');

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (characters) {
      fs.writeFileSync(path.join(DATA_DIR, 'characters.json'), JSON.stringify(characters, null, 2));
    }
    if (models) {
      fs.writeFileSync(path.join(DATA_DIR, 'models.json'), JSON.stringify(models, null, 2));
    }
    if (books) {
      fs.writeFileSync(path.join(DATA_DIR, 'books.json'), JSON.stringify(books, null, 2));
    }
    if (chapters) {
      fs.writeFileSync(path.join(DATA_DIR, 'chapters.json'), JSON.stringify(chapters, null, 2));
    }
    if (scenes) {
      fs.writeFileSync(path.join(DATA_DIR, 'scenes.json'), JSON.stringify(scenes, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
  }
}
