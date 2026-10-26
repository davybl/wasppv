import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, generateId } from '@/lib/storage';
import { Model } from '@/lib/types';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const models = readJsonFile<Model>('models.json');
    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read models' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const category = formData.get('category') as Model['category'];
    const linkedCharacterId = formData.get('linkedCharacterId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), 'public', 'models', fileName);

    await writeFile(filePath, buffer);

    const models = readJsonFile<Model>('models.json');
    
    const newModel: Model = {
      id: generateId(),
      name: name || file.name,
      category: category || 'Props',
      filePath: `/models/${fileName}`,
      fileSize: file.size,
      polygonCount: 0,
      isRigged: false,
      linkedCharacterId: linkedCharacterId || undefined,
    };
    
    models.push(newModel);
    writeJsonFile('models.json', models);
    
    return NextResponse.json(newModel, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload model' }, { status: 500 });
  }
}
