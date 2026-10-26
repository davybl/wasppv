'use client';

import { useEffect, useState } from 'react';
import { FileDown, Database, Plus, Bold, Italic, Quote, Minus, Columns, Maximize, X, Save, User } from 'lucide-react';
import { Book, Chapter, Character } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';

export default function ChaptersPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookNumber, setNewBookNumber] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [isSplitView, setIsSplitView] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/books').then(res => res.json()),
      fetch('/api/chapters').then(res => res.json()),
      fetch('/api/characters').then(res => res.json()),
    ]).then(([booksData, chaptersData, charactersData]) => {
      setBooks(booksData);
      setChapters(chaptersData);
      setCharacters(charactersData);
      if (booksData.length > 0) {
        setSelectedBookId(booksData[0].id);
      }
      if (chaptersData.length > 0) {
        setSelectedChapter(chaptersData[0]);
      }
      setLoading(false);
    });
  }, []);

  const filteredChapters = selectedBookId
    ? chapters.filter(c => c.bookId === selectedBookId)
    : chapters;

  const selectedBook = books.find(b => b.id === selectedBookId);

  const handleSaveChapter = async () => {
    if (!selectedChapter) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/chapters/${selectedChapter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedChapter),
      });
      if (response.ok) {
        const updated = await response.json();
        setChapters(chapters.map(c => c.id === updated.id ? updated : c));
        (window as any).toast?.add('Chapter saved successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to save chapter:', error);
      (window as any).toast?.add('Failed to save chapter', 'error');
    }
    setSaving(false);
  };

  const handleAddBook = async () => {
    if (!newBookTitle || !newBookNumber) return;
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBookTitle, number: parseInt(newBookNumber) }),
      });
      if (response.ok) {
        const newBook = await response.json();
        setBooks([...books, newBook]);
        setSelectedBookId(newBook.id);
        setShowBookModal(false);
        setNewBookTitle('');
        setNewBookNumber('');
        (window as any).toast?.add('Book added successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to add book:', error);
      (window as any).toast?.add('Failed to add book', 'error');
    }
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle || !selectedBookId) return;
    try {
      const bookChapters = filteredChapters;
      const nextNumber = bookChapters.length + 1;
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: selectedBookId,
          chapterNumber: nextNumber,
          title: newChapterTitle,
          content: `# Book ${selectedBook?.number}: ${selectedBook?.title}\n## Chapter ${nextNumber}: ${newChapterTitle}\n\n`,
        }),
      });
      if (response.ok) {
        const newChapter = await response.json();
        setChapters([...chapters, newChapter]);
        setSelectedChapter(newChapter);
        setShowChapterModal(false);
        setNewChapterTitle('');
        (window as any).toast?.add('Chapter added successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to add chapter:', error);
      (window as any).toast?.add('Failed to add chapter', 'error');
    }
  };

  const handleExportMD = () => {
    if (!selectedChapter) return;
    const blob = new Blob([selectedChapter.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Book_${selectedBook?.number}_Chapter_${selectedChapter.chapterNumber}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    (window as any).toast?.add('Chapter exported as Markdown', 'success');
  };

  const handleExportJSON = async () => {
    const allData = { books, chapters };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'full_lore_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    (window as any).toast?.add('Full lore exported as JSON', 'success');
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!selectedChapter) return;
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedChapter.content;
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    setSelectedChapter({
      ...selectedChapter,
      content: newText,
      wordCount: newText.split(/\s+/).filter(w => w).length,
      characterCount: newText.length,
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const highlightCharacters = (text: string) => {
    let highlighted = text;
    characters.forEach(char => {
      const regex = new RegExp(`\\b${char.name}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-cyan-400 cursor-pointer hover:underline" data-character-id="${char.id}">${char.name}</span>`);
    });
    return highlighted;
  };

  const handleCharacterClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.dataset.characterId) {
      const char = characters.find(c => c.id === target.dataset.characterId);
      if (char) {
        setSelectedCharacter(char);
        setShowCharacterModal(true);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Chapter & Script Editor</h2>
          <p className="text-zinc-400 text-sm">Distraction-free markdown writing with entity highlighting</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportMD} className="bg-cyan-700 hover:bg-cyan-600 transition-colors px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer">
            <FileDown className="w-4 h-4" />
            Export to .md
          </button>
          <button onClick={handleExportJSON} className="bg-cyan-700 hover:bg-cyan-600 transition-colors px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer">
            <Database className="w-4 h-4" />
            Export Full JSON
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Chapter Navigation Sidebar */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            {/* Book Selector */}
            <div className="mb-4">
              <label className="text-xs text-zinc-500 block mb-2">Select Book</label>
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                value={selectedBookId}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setShowBookModal(true);
                  } else {
                    setSelectedBookId(e.target.value);
                  }
                }}
              >
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    Book {book.number}: {book.title}
                  </option>
                ))}
                <option value="">+ Add New Book</option>
              </select>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Chapters</h3>
              <button onClick={() => setShowChapterModal(true)} className="text-cyan-400 hover:text-cyan-300 cursor-pointer">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {filteredChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className={`p-3 rounded cursor-pointer border-l-2 transition-colors ${
                    selectedChapter?.id === chapter.id
                      ? 'bg-zinc-800 border-cyan-500'
                      : 'bg-zinc-800/50 border-transparent hover:bg-zinc-800'
                  }`}
                  onClick={() => setSelectedChapter(chapter)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      Book {selectedBook?.number} - Chapter {chapter.chapterNumber}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded text-white ${
                      chapter.status === 'draft' ? 'bg-zinc-600' :
                      chapter.status === 'in_review' ? 'bg-amber-600' :
                      'bg-green-600'
                    }`}>
                      {chapter.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate">{chapter.title}</p>
                  <div className="flex gap-3 mt-2 text-xs text-zinc-500">
                    <span>{chapter.wordCount} words</span>
                    <span>{chapter.characterCount} chars</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-700 text-xs text-zinc-500">
              <p>Chapter order can be adjusted in the edit modal</p>
            </div>
          </div>
        </div>

        {/* Markdown Writing Canvas */}
        <div className="flex-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            {/* Formatting Toolbar */}
            <div className="bg-zinc-800 p-3 border-b border-zinc-700 flex items-center gap-2">
              <button onClick={() => insertFormatting('# ')} className="p-2 hover:bg-zinc-700 rounded cursor-pointer" title="Header 1">
                <span className="font-bold text-sm">H1</span>
              </button>
              <button onClick={() => insertFormatting('## ')} className="p-2 hover:bg-zinc-700 rounded cursor-pointer" title="Header 2">
                <span className="font-bold text-sm">H2</span>
              </button>
              <button onClick={() => insertFormatting('### ')} className="p-2 hover:bg-zinc-700 rounded cursor-pointer" title="Header 3">
                <span className="font-bold text-sm">H3</span>
              </button>
              <div className="w-px h-6 bg-zinc-600 mx-2"></div>
              <button onClick={() => insertFormatting('**', '**')} className="p-2 hover:bg-zinc-700 rounded cursor-pointer" title="Bold">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormatting('*', '*')} className="p-2 hover:bg-zinc-700 rounded cursor-pointer" title="Italic">
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-zinc-600 mx-2"></div>
              <button onClick={() => insertFormatting('> ')} className="p-2 hover:bg-zinc-700 rounded cursor-pointer" title="Dialogue Blockquote">
                <Quote className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormatting('\n---\n\n')} className="p-2 hover:bg-zinc-700 rounded cursor-pointer" title="Scene Divider">
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1"></div>
              <button
                onClick={handleSaveChapter}
                disabled={saving}
                className="bg-cyan-700 hover:bg-cyan-600 disabled:bg-zinc-600 px-3 py-1 rounded text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setIsSplitView(!isSplitView)}
                className={`p-2 hover:bg-zinc-700 rounded cursor-pointer ${isSplitView ? 'text-cyan-400' : ''}`}
                title="Split View"
              >
                <Columns className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-zinc-700 rounded cursor-pointer"
                title="Full Screen"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>

            {/* Editor Area */}
            <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-zinc-950 p-6' : ''} flex ${isSplitView ? 'h-96' : 'h-96'}`}>
              {isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-300 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
              {/* Text Editor */}
              <div className={`${isSplitView ? 'flex-1' : 'w-full'} p-4`}>
                <textarea
                  className="w-full h-full bg-transparent text-zinc-200 text-sm resize-none focus:outline-none font-mono"
                  value={selectedChapter?.content || ''}
                  onChange={(e) => {
                    if (selectedChapter) {
                      setSelectedChapter({
                        ...selectedChapter,
                        content: e.target.value,
                        wordCount: e.target.value.split(/\s+/).filter(w => w).length,
                        characterCount: e.target.value.length,
                      });
                    }
                  }}
                  placeholder="Start writing your chapter..."
                />
              </div>

              {/* Live Preview */}
              {isSplitView && (
                <div
                  className="flex-1 p-4 border-l border-zinc-700 bg-zinc-900/50"
                  onClick={handleCharacterClick}
                >
                  <div className="text-sm text-zinc-300 prose prose-invert max-w-none">
                    {selectedChapter ? (
                      <div dangerouslySetInnerHTML={{ __html: highlightCharacters(selectedChapter.content).replace(/\n/g, '<br/>') }} />
                    ) : (
                      <p className="text-zinc-500">Select a chapter to edit</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Entity Legend */}
            <div className="bg-zinc-800 p-3 border-t border-zinc-700 text-xs">
              <span className="text-zinc-500 mr-4">Character names are auto-highlighted. Click to view Character Vault card.</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Registered Character
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Book Modal */}
      <Modal isOpen={showBookModal} onClose={() => setShowBookModal(false)} title="Add New Book">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Book Number</label>
            <input
              type="number"
              value={newBookNumber}
              onChange={(e) => setNewBookNumber(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              placeholder="e.g., 1"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Book Title</label>
            <input
              type="text"
              value={newBookTitle}
              onChange={(e) => setNewBookTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              placeholder="e.g., Earth Prime Awakening"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleAddBook}
              className="flex-1 bg-cyan-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm"
            >
              Add Book
            </button>
            <button
              onClick={() => setShowBookModal(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Chapter Modal */}
      <Modal isOpen={showChapterModal} onClose={() => setShowChapterModal(false)} title="Add New Chapter">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Chapter Title</label>
            <input
              type="text"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              placeholder="e.g., The Awakening"
            />
          </div>
          <p className="text-xs text-zinc-500">
            This will be added as Chapter {filteredChapters.length + 1} to Book {selectedBook?.number}: {selectedBook?.title}
          </p>
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleAddChapter}
              className="flex-1 bg-cyan-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm"
            >
              Add Chapter
            </button>
            <button
              onClick={() => setShowChapterModal(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Character Preview Modal */}
      <Modal isOpen={showCharacterModal} onClose={() => setShowCharacterModal(false)} title="Character Details">
        {selectedCharacter && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedCharacter.name}</h3>
                <p className="text-zinc-400">{selectedCharacter.faction}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500 block">Age</span>
                <span className="text-zinc-200">{selectedCharacter.age}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Lineage</span>
                <span className="text-zinc-200">{selectedCharacter.lineage}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Primary Ability</span>
                <span className="text-zinc-200">{selectedCharacter.primaryAbility}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Secondary Ability</span>
                <span className="text-zinc-200">{selectedCharacter.secondaryAbility}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Power Efficiency</span>
                <span className="text-zinc-200">{selectedCharacter.powerEfficiency}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Height Ratio</span>
                <span className="text-zinc-200">{selectedCharacter.heightRatio}</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 block text-sm mb-1">Visual Indicators</span>
              <p className="text-zinc-200 text-sm">{selectedCharacter.visualIndicators}</p>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowCharacterModal(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
