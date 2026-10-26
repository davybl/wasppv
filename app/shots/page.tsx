'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Edit, ArrowRight, Trash2, Check, GripVertical } from 'lucide-react';
import { Book, Chapter, Scene, Character } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function ShotsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    characterIds: [] as string[],
    environmentId: '',
    cameraShotType: '',
    dialogue: '',
    estimatedLength: '30',
    status: 'scripted' as Scene['status'],
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/books').then(res => res.json()),
      fetch('/api/chapters').then(res => res.json()),
      fetch('/api/scenes').then(res => res.json()),
      fetch('/api/characters').then(res => res.json()),
    ]).then(([booksData, chaptersData, scenesData, charactersData]) => {
      setBooks(booksData);
      setChapters(chaptersData);
      setScenes(scenesData);
      setCharacters(charactersData);
      if (booksData.length > 0) {
        setSelectedBookId(booksData[0].id);
      }
      setLoading(false);
    });
  }, []);

  const filteredChapters = selectedBookId
    ? chapters.filter(c => c.bookId === selectedBookId)
    : chapters;

  const filteredScenes = selectedChapterId
    ? scenes.filter(s => s.chapterId === selectedChapterId)
    : selectedBookId
    ? scenes.filter(s => s.bookId === selectedBookId)
    : scenes;

  const selectedBook = books.find(b => b.id === selectedBookId);
  const selectedChapter = chapters.find(c => c.id === selectedChapterId);

  const getStatusColor = (status: Scene['status']) => {
    switch (status) {
      case 'scripted': return 'bg-violet-600';
      case 'storyboarded': return 'bg-cyan-600';
      case 'previz': return 'bg-orange-600';
      case 'animated': return 'bg-yellow-600';
      case 'rendered': return 'bg-green-600';
      default: return 'bg-zinc-600';
    }
  };

  const statusOrder: Scene['status'][] = ['scripted', 'storyboarded', 'previz', 'animated', 'rendered'];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredScenes.findIndex((scene) => scene.id === active.id);
      const newIndex = filteredScenes.findIndex((scene) => scene.id === over.id);

      const newScenes = arrayMove(filteredScenes, oldIndex, newIndex);
      const updatedScenes = newScenes.map((scene, index) => ({
        ...scene,
        order: index,
      }));

      // Update all scenes with new order
      updatedScenes.forEach((scene) => {
        fetch(`/api/scenes/${scene.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scene),
        });
      });

      setScenes(scenes.map(s => {
        const updated = updatedScenes.find(us => us.id === s.id);
        return updated || s;
      }));

      (window as any).toast?.add('Scene order updated', 'success');
    }
  };

  function SortableScene({ scene, onEdit, onMove, onDelete, selectedBook, selectedChapter, getStatusColor }: {
    scene: Scene;
    onEdit: (scene: Scene) => void;
    onMove: (scene: Scene) => void;
    onDelete: (scene: Scene) => void;
    selectedBook: Book | undefined;
    selectedChapter: Chapter | undefined;
    getStatusColor: (status: Scene['status']) => string;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: scene.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <button {...attributes} {...listeners} className="text-zinc-500 hover:text-zinc-300 cursor-grab">
              <GripVertical className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h3 className="font-semibold">{scene.title}</h3>
              <p className="text-zinc-400 text-sm">
                Book {selectedBook?.number} - Chapter {selectedChapter?.chapterNumber}: {selectedChapter?.title}
              </p>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded text-white ${getStatusColor(scene.status)}`}>
            {scene.status.replace('_', ' ')}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-sm mb-3">
          <div>
            <span className="text-zinc-500 block">Characters</span>
            <span className="text-zinc-200">{scene.characterIds.length > 0 ? `${scene.characterIds.length} characters` : 'None'}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Environment</span>
            <span className="text-zinc-200">{scene.environmentId || 'Not set'}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Camera Shot</span>
            <span className="text-zinc-200">{scene.cameraShotType || 'Not set'}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Est. Length</span>
            <span className="text-zinc-200">{scene.estimatedLength}s</span>
          </div>
        </div>
        {scene.dialogue && (
          <div className="bg-zinc-800 p-3 rounded text-sm mb-3">
            <span className="text-zinc-500 block mb-1">Dialogue & Audio Cues</span>
            <p className="text-zinc-300 italic">{scene.dialogue}</p>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(scene)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <Edit className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => onMove(scene)}
            className="text-xs text-zinc-400 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
          >
            <ArrowRight className="w-3 h-3" /> Move to Next Stage
          </button>
          <button
            onClick={() => onDelete(scene)}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
    );
  }

  const handleCreateScene = async () => {
    if (!formData.title || !selectedBookId || !selectedChapterId) {
      (window as any).toast?.add('Please fill in required fields', 'error');
      return;
    }

    try {
      const response = await fetch('/api/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bookId: selectedBookId,
          chapterId: selectedChapterId,
          estimatedLength: parseInt(formData.estimatedLength),
          order: filteredScenes.length,
        }),
      });
      if (response.ok) {
        const newScene = await response.json();
        setScenes([...scenes, newScene]);
        setShowCreateModal(false);
        resetForm();
        (window as any).toast?.add('Scene created successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to create scene:', error);
      (window as any).toast?.add('Failed to create scene', 'error');
    }
  };

  const handleEditScene = async () => {
    if (!selectedScene) return;
    try {
      const response = await fetch(`/api/scenes/${selectedScene.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedLength: parseInt(formData.estimatedLength),
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        setScenes(scenes.map(s => s.id === updated.id ? updated : s));
        setShowEditModal(false);
        setSelectedScene(null);
        resetForm();
        (window as any).toast?.add('Scene updated successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to update scene:', error);
      (window as any).toast?.add('Failed to update scene', 'error');
    }
  };

  const handleDeleteScene = async () => {
    if (!selectedScene) return;
    try {
      const response = await fetch(`/api/scenes/${selectedScene.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setScenes(scenes.filter(s => s.id !== selectedScene.id));
        setShowDeleteModal(false);
        setSelectedScene(null);
        (window as any).toast?.add('Scene deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to delete scene:', error);
      (window as any).toast?.add('Failed to delete scene', 'error');
    }
  };

  const handleMoveToNextStage = (scene: Scene) => {
    const currentIndex = statusOrder.indexOf(scene.status);
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      fetch(`/api/scenes/${scene.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scene, status: nextStatus }),
      })
        .then(res => res.json())
        .then(updated => {
          setScenes(scenes.map(s => s.id === updated.id ? updated : s));
          (window as any).toast?.add(`Scene moved to ${nextStatus.replace('_', ' ')}`, 'success');
        })
        .catch(() => (window as any).toast?.add('Failed to move scene', 'error'));
    }
  };

  const toggleCharacter = (characterId: string) => {
    setFormData(prev => ({
      ...prev,
      characterIds: prev.characterIds.includes(characterId)
        ? prev.characterIds.filter(id => id !== characterId)
        : [...prev.characterIds, characterId],
    }));
  };

  const openEditModal = (scene: Scene) => {
    setSelectedScene(scene);
    setFormData({
      title: scene.title,
      description: scene.description,
      characterIds: scene.characterIds,
      environmentId: scene.environmentId || '',
      cameraShotType: scene.cameraShotType,
      dialogue: scene.dialogue,
      estimatedLength: scene.estimatedLength.toString(),
      status: scene.status,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      characterIds: [],
      environmentId: '',
      cameraShotType: '',
      dialogue: '',
      estimatedLength: '30',
      status: 'scripted',
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Shot List & Scenes</h2>
          <p className="text-zinc-400 text-sm">Chapter-to-scene breakdown tool</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="bg-cyan-700 hover:bg-cyan-600 transition-colors px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Create Scene
        </button>
      </div>

      {/* Book & Chapter Filter */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="text-sm text-zinc-400 block mb-2">Filter by Book</label>
          <select
            className="w-48 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm cursor-pointer"
            value={selectedBookId}
            onChange={(e) => {
              setSelectedBookId(e.target.value);
              setSelectedChapterId('');
            }}
          >
            <option value="">All Books</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                Book {book.number}: {book.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-zinc-400 block mb-2">Filter by Chapter</label>
          <select
            className="w-64 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm cursor-pointer"
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
          >
            <option value="">All Chapters</option>
            {filteredChapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                Book {selectedBook?.number} - Chapter {chapter.chapterNumber}: {chapter.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scene Cards */}
      <div className="space-y-4">
        {filteredScenes.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg text-center text-zinc-500">
            No scenes found. Create your first scene to get started.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredScenes.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {filteredScenes.map((scene) => (
                <SortableScene
                  key={scene.id}
                  scene={scene}
                  onEdit={openEditModal}
                  onMove={handleMoveToNextStage}
                  onDelete={(s) => {
                    setSelectedScene(s);
                    setShowDeleteModal(true);
                  }}
                  selectedBook={selectedBook}
                  selectedChapter={selectedChapter}
                  getStatusColor={getStatusColor}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Status Legend */}
      <div className="mt-6 flex gap-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-violet-600 rounded"></span> Scripted</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-cyan-600 rounded"></span> Storyboarded</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-600 rounded"></span> 3D Pre-vis</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-600 rounded"></span> Animated</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-600 rounded"></span> Rendered</span>
      </div>

      {/* Create Scene Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Scene">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Scene Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm h-20"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Characters (Multi-select)</label>
            <div className="space-y-2 max-h-32 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded p-2">
              {characters.map(char => (
                <label key={char.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.characterIds.includes(char.id)}
                    onChange={() => toggleCharacter(char.id)}
                    className="w-4 h-4"
                  />
                  <span>{char.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Environment ID</label>
              <input
                type="text"
                value={formData.environmentId}
                onChange={(e) => setFormData({ ...formData, environmentId: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                placeholder="e.g., env-1"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Camera Shot Type</label>
              <input
                type="text"
                value={formData.cameraShotType}
                onChange={(e) => setFormData({ ...formData, cameraShotType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                placeholder="e.g., Wide shot"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Dialogue & Audio Cues</label>
            <textarea
              value={formData.dialogue}
              onChange={(e) => setFormData({ ...formData, dialogue: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm h-20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Estimated Length (seconds)</label>
              <input
                type="number"
                value={formData.estimatedLength}
                onChange={(e) => setFormData({ ...formData, estimatedLength: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Scene['status'] })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              >
                {statusOrder.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleCreateScene}
              className="flex-1 bg-cyan-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm"
            >
              Create Scene
            </button>
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Scene Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Scene">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Scene Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm h-20"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Characters (Multi-select)</label>
            <div className="space-y-2 max-h-32 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded p-2">
              {characters.map(char => (
                <label key={char.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.characterIds.includes(char.id)}
                    onChange={() => toggleCharacter(char.id)}
                    className="w-4 h-4"
                  />
                  <span>{char.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Environment ID</label>
              <input
                type="text"
                value={formData.environmentId}
                onChange={(e) => setFormData({ ...formData, environmentId: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Camera Shot Type</label>
              <input
                type="text"
                value={formData.cameraShotType}
                onChange={(e) => setFormData({ ...formData, cameraShotType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Dialogue & Audio Cues</label>
            <textarea
              value={formData.dialogue}
              onChange={(e) => setFormData({ ...formData, dialogue: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm h-20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Estimated Length (seconds)</label>
              <input
                type="number"
                value={formData.estimatedLength}
                onChange={(e) => setFormData({ ...formData, estimatedLength: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Scene['status'] })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              >
                {statusOrder.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleEditScene}
              className="flex-1 bg-cyan-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm"
            >
              Save Changes
            </button>
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Scene">
        <div className="space-y-4">
          <p className="text-zinc-300">
            Are you sure you want to delete <strong>{selectedScene?.title}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleDeleteScene}
              className="flex-1 bg-red-700 hover:bg-red-600 px-4 py-2 rounded text-sm"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
