import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/storage';
import { Model } from '@/lib/types';
import { unlink } from 'fs/promises';
import path from 'path';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const models = readJsonFile<Model>('models.json');

    const index = models.findIndex(m => m.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    models[index] = { ...models[index], ...body };
    writeJsonFile('models.json', models);

    return NextResponse.json(models[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update model' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const models = readJsonFile<Model>('models.json');

    const index = models.findIndex(m => m.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const model = models[index];

    // Delete the file
    const filePath = path.join(process.cwd(), 'public', model.filePath);
    try {
      await unlink(filePath);
    } catch (err) {
      console.error('Failed to delete file:', err);
    }

    models.splice(index, 1);
    writeJsonFile('models.json', models);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 });
  }
}
