'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Edit, Code, User, Trash2, Search, X } from 'lucide-react';
import { Character } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [factionFilter, setFactionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    faction: '',
    lineage: '',
    primaryAbility: '',
    secondaryAbility: '',
    powerEfficiency: '',
    visualIndicators: '',
    heightRatio: '1.0',
    outfitColors: '#7c3aed',
  });

  useEffect(() => {
    fetch('/api/characters')
      .then(res => res.json())
      .then(data => {
        setCharacters(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load characters:', err);
        setLoading(false);
      });
  }, []);

  const factions = Array.from(new Set(characters.map(c => c.faction)));

  const filteredAndSortedCharacters = characters
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.faction.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFaction = factionFilter === 'all' || c.faction === factionFilter;
      return matchesSearch && matchesFaction;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'age': return a.age - b.age;
        case 'faction': return a.faction.localeCompare(b.faction);
        default: return 0;
      }
    });

  const handleAddCharacter = async () => {
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          heightRatio: parseFloat(formData.heightRatio),
        }),
      });
      if (response.ok) {
        const newCharacter = await response.json();
        setCharacters([...characters, newCharacter]);
        setShowAddModal(false);
        resetForm();
        (window as any).toast?.add('Character added successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to add character:', error);
      (window as any).toast?.add('Failed to add character', 'error');
    }
  };

  const handleEditCharacter = async () => {
    if (!selectedCharacter) return;
    try {
      const response = await fetch(`/api/characters/${selectedCharacter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          heightRatio: parseFloat(formData.heightRatio),
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        setCharacters(characters.map(c => c.id === updated.id ? updated : c));
        setShowEditModal(false);
        resetForm();
        setSelectedCharacter(null);
        (window as any).toast?.add('Character updated successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to update character:', error);
      (window as any).toast?.add('Failed to update character', 'error');
    }
  };

  const handleDeleteCharacter = async () => {
    if (!selectedCharacter) return;
    try {
      const response = await fetch(`/api/characters/${selectedCharacter.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCharacters(characters.filter(c => c.id !== selectedCharacter.id));
        setShowDeleteModal(false);
        setSelectedCharacter(null);
        (window as any).toast?.add('Character deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to delete character:', error);
      (window as any).toast?.add('Failed to delete character', 'error');
    }
  };

  const handleExportJSON = (character: Character) => {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name.replace(/\s+/g, '_')}_character.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    (window as any).toast?.add('Character JSON exported', 'success');
  };

  const openEditModal = (character: Character) => {
    setSelectedCharacter(character);
    setFormData({
      name: character.name,
      age: character.age.toString(),
      faction: character.faction,
      lineage: character.lineage,
      primaryAbility: character.primaryAbility,
      secondaryAbility: character.secondaryAbility,
      powerEfficiency: character.powerEfficiency,
      visualIndicators: character.visualIndicators,
      heightRatio: character.heightRatio.toString(),
      outfitColors: character.outfitColors,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      faction: '',
      lineage: '',
      primaryAbility: '',
      secondaryAbility: '',
      powerEfficiency: '',
      visualIndicators: '',
      heightRatio: '1.0',
      outfitColors: '#7c3aed',
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Character Vault</h2>
          <p className="text-zinc-400 text-sm">Manage story characters and lore</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-cyan-700 hover:bg-cyan-600 transition-colors px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Character
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={factionFilter}
          onChange={(e) => setFactionFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="all">All Factions</option>
          {factions.map(faction => (
            <option key={faction} value={faction}>{faction}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="name">Sort by Name</option>
          <option value="age">Sort by Age</option>
          <option value="faction">Sort by Faction</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredAndSortedCharacters.map((character) => (
          <div
            key={character.id}
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg hover:border-cyan-500 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-xs px-2 py-1 rounded bg-zinc-700 text-white">
                {character.faction}
              </span>
            </div>
            <h3 className="font-semibold text-lg">{character.name}</h3>
            <p className="text-zinc-400 text-sm mb-2">
              Age: {character.age} | Faction: {character.faction}
            </p>
            <p className="text-zinc-500 text-xs">
              Primary: {character.primaryAbility} | Secondary: {character.secondaryAbility}
            </p>
            <div className="mt-3 pt-3 border-t border-zinc-700 flex gap-2">
              <button
                onClick={() => openEditModal(character)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Edit className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => handleExportJSON(character)}
                className="text-xs text-zinc-400 hover:text-zinc-300 flex items-center gap-1"
              >
                <Code className="w-3 h-3" /> Export JSON
              </button>
              <button
                onClick={() => {
                  setSelectedCharacter(character);
                  setShowDeleteModal(true);
                }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Character Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Character">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Faction</label>
              <input
                type="text"
                value={formData.faction}
                onChange={(e) => setFormData({ ...formData, faction: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Lineage</label>
            <input
              type="text"
              value={formData.lineage}
              onChange={(e) => setFormData({ ...formData, lineage: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Primary Ability</label>
              <input
                type="text"
                value={formData.primaryAbility}
                onChange={(e) => setFormData({ ...formData, primaryAbility: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Secondary Ability</label>
              <input
                type="text"
                value={formData.secondaryAbility}
                onChange={(e) => setFormData({ ...formData, secondaryAbility: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Power Efficiency</label>
            <input
              type="text"
              value={formData.powerEfficiency}
              onChange={(e) => setFormData({ ...formData, powerEfficiency: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Visual Indicators</label>
            <input
              type="text"
              value={formData.visualIndicators}
              onChange={(e) => setFormData({ ...formData, visualIndicators: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Height Ratio</label>
              <input
                type="number"
                step="0.01"
                value={formData.heightRatio}
                onChange={(e) => setFormData({ ...formData, heightRatio: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Outfit Colors</label>
              <input
                type="color"
                value={formData.outfitColors}
                onChange={(e) => setFormData({ ...formData, outfitColors: e.target.value })}
                className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleAddCharacter}
              className="flex-1 bg-cyan-700 hover:bg-cyan-600 px-4 py-2 rounded text-sm"
            >
              Add Character
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Character Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Character">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Faction</label>
              <input
                type="text"
                value={formData.faction}
                onChange={(e) => setFormData({ ...formData, faction: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Lineage</label>
            <input
              type="text"
              value={formData.lineage}
              onChange={(e) => setFormData({ ...formData, lineage: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Primary Ability</label>
              <input
                type="text"
                value={formData.primaryAbility}
                onChange={(e) => setFormData({ ...formData, primaryAbility: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Secondary Ability</label>
              <input
                type="text"
                value={formData.secondaryAbility}
                onChange={(e) => setFormData({ ...formData, secondaryAbility: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Power Efficiency</label>
            <input
              type="text"
              value={formData.powerEfficiency}
              onChange={(e) => setFormData({ ...formData, powerEfficiency: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Visual Indicators</label>
            <input
              type="text"
              value={formData.visualIndicators}
              onChange={(e) => setFormData({ ...formData, visualIndicators: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Height Ratio</label>
              <input
                type="number"
                step="0.01"
                value={formData.heightRatio}
                onChange={(e) => setFormData({ ...formData, heightRatio: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1">Outfit Colors</label>
              <input
                type="color"
                value={formData.outfitColors}
                onChange={(e) => setFormData({ ...formData, outfitColors: e.target.value })}
                className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleEditCharacter}
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
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Character">
        <div className="space-y-4">
          <p className="text-zinc-300">
            Are you sure you want to delete <strong>{selectedCharacter?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleDeleteCharacter}
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
