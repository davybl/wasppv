'use client';

import { useEffect, useState } from 'react';
import { Upload, Box, Castle, Sword, Car, Edit, Trash2, X } from 'lucide-react';
import { Model } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Characters' as Model['category'],
    linkedCharacterId: '',
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        setModels(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load models:', err);
        setLoading(false);
      });
  }, []);

  const filteredModels = selectedCategory === 'all'
    ? models
    : models.filter(m => m.category === selectedCategory);

  const getCategoryIcon = (category: Model['category']) => {
    switch (category) {
      case 'Characters': return Box;
      case 'Environments': return Castle;
      case 'Props': return Sword;
      case 'Vehicles': return Car;
      default: return Box;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async () => {
    if (!file || !formData.name) {
      (window as any).toast?.add('Please select a file and enter a name', 'error');
      return;
    }

    setUploading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('category', formData.category);
    if (formData.linkedCharacterId) {
      formDataToSend.append('linkedCharacterId', formData.linkedCharacterId);
    }

    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        const newModel = await response.json();
        setModels([...models, newModel]);
        setShowUploadModal(false);
        setFile(null);
        setFormData({ name: '', category: 'Characters', linkedCharacterId: '' });
        (window as any).toast?.add('Model uploaded successfully', 'success');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload model:', error);
      (window as any).toast?.add('Failed to upload model', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEditModel = async () => {
    if (!selectedModel) return;
    try {
      const response = await fetch(`/api/models/${selectedModel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updated = await response.json();
        setModels(models.map(m => m.id === updated.id ? updated : m));
        setShowEditModal(false);
        setSelectedModel(null);
        (window as any).toast?.add('Model updated successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to update model:', error);
      (window as any).toast?.add('Failed to update model', 'error');
    }
  };

  const handleDeleteModel = async () => {
    if (!selectedModel) return;
    try {
      const response = await fetch(`/api/models/${selectedModel.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setModels(models.filter(m => m.id !== selectedModel.id));
        setShowDeleteModal(false);
        setSelectedModel(null);
        (window as any).toast?.add('Model deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
      (window as any).toast?.add('Failed to delete model', 'error');
    }
  };

  const openEditModal = (model: Model) => {
    setSelectedModel(model);
    setFormData({
      name: model.name,
      category: model.category,
      linkedCharacterId: model.linkedCharacterId || '',
    });
    setShowEditModal(true);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">3D Model Library</h2>
          <p className="text-zinc-400 text-sm">Browse and preview 3D assets</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-cyan-700 hover:bg-cyan-600 transition-colors px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload Model
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'Characters', 'Environments', 'Props', 'Vehicles'].map((category) => (
          <button
            key={category}
            className={`px-3 py-1 rounded text-sm transition-colors cursor-pointer ${
              selectedCategory === category
                ? 'bg-cyan-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Model Grid */}
      {filteredModels.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg text-center text-zinc-500">
          No models found. Upload your first 3D model to get started.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filteredModels.map((model) => {
            const Icon = getCategoryIcon(model.category);
            return (
              <div
                key={model.id}
                className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg hover:border-cyan-500 transition-colors group cursor-pointer"
              >
                <div className="h-24 bg-zinc-800 rounded mb-2 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-sm font-medium truncate">{model.name}</p>
                <p className="text-xs text-zinc-500">
                  {model.category} • {formatFileSize(model.fileSize)}
                </p>
                <div className="mt-2 pt-2 border-t border-zinc-700 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(model)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModel(model);
                      setShowDeleteModal(true);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload 3D Model">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Model File (.glb/.gltf)</label>
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Model Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Model['category'] })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            >
              <option value="Characters">Characters</option>
              <option value="Environments">Environments</option>
              <option value="Props">Props</option>
              <option value="Vehicles">Vehicles</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Linked Character ID (Optional)</label>
            <input
              type="text"
              value={formData.linkedCharacterId}
              onChange={(e) => setFormData({ ...formData, linkedCharacterId: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              placeholder="e.g., char-1"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-cyan-700 hover:bg-cyan-600 disabled:bg-zinc-600 px-4 py-2 rounded text-sm"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={() => setShowUploadModal(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Model">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Model Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Model['category'] })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            >
              <option value="Characters">Characters</option>
              <option value="Environments">Environments</option>
              <option value="Props">Props</option>
              <option value="Vehicles">Vehicles</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Linked Character ID (Optional)</label>
            <input
              type="text"
              value={formData.linkedCharacterId}
              onChange={(e) => setFormData({ ...formData, linkedCharacterId: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleEditModel}
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
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Model">
        <div className="space-y-4">
          <p className="text-zinc-300">
            Are you sure you want to delete <strong>{selectedModel?.name}</strong>? This will also delete the model file.
          </p>
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleDeleteModel}
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
