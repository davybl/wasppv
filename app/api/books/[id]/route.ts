import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/storage';
import { Book } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const books = readJsonFile<Book>('books.json');

    const index = books.findIndex(b => b.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    books[index] = { ...books[index], ...body };
    writeJsonFile('books.json', books);

    return NextResponse.json(books[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const books = readJsonFile<Book>('books.json');

    const index = books.findIndex(b => b.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    books.splice(index, 1);
    writeJsonFile('books.json', books);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
