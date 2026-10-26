import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile, generateId } from '@/lib/storage';
import { Book } from '@/lib/types';

export async function GET() {
  try {
    const books = readJsonFile<Book>('books.json');
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read books' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const books = readJsonFile<Book>('books.json');
    
    const newBook: Book = {
      id: generateId(),
      number: body.number,
      title: body.title,
      order: books.length,
    };
    
    books.push(newBook);
    writeJsonFile('books.json', books);
    
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
