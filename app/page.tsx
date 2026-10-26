'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Box, BookOpen, CheckCircle, UserPlus, Upload, PlusCircle, Download, UploadCloud } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    characters: 0,
    models: 0,
    chapters: 0,
    renderedScenes: 0,
  });
  const [loading, setLoading] = useState(true);

  const handleExportAll = async () => {
    try {
      const response = await fetch('/api/sync');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wasppv_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      (window as any).toast?.add('All data exported successfully', 'success');
    } catch (error) {
      (window as any).toast?.add('Failed to export data', 'error');
    }
  };

  const handleImportAll = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!confirm('This will overwrite all existing data. Are you sure?')) {
          return;
        }

        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          (window as any).toast?.add('Data imported successfully. Refreshing...', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          throw new Error('Import failed');
        }
      } catch (error) {
        (window as any).toast?.add('Failed to import data', 'error');
      }
    };
    input.click();
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/characters').then(res => res.json()),
      fetch('/api/models').then(res => res.json()),
      fetch('/api/chapters').then(res => res.json()),
      fetch('/api/scenes').then(res => res.json()),
    ]).then(([characters, models, chapters, scenes]) => {
      setStats({
        characters: characters.length,
        models: models.length,
        chapters: chapters.length,
        renderedScenes: scenes.filter((s: any) => s.status === 'rendered').length,
      });
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-zinc-400 text-sm">Overview of your production assets</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Total Characters</p>
              <p className="text-2xl font-bold text-cyan-400">{loading ? '...' : stats.characters}</p>
            </div>
            <Users className="w-8 h-8 text-zinc-600" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Total 3D Models</p>
              <p className="text-2xl font-bold text-purple-400">{loading ? '...' : stats.models}</p>
            </div>
            <Box className="w-8 h-8 text-zinc-600" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Chapters Outlined</p>
              <p className="text-2xl font-bold text-amber-400">{loading ? '...' : stats.chapters}</p>
            </div>
            <BookOpen className="w-8 h-8 text-zinc-600" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Rendered Scenes</p>
              <p className="text-2xl font-bold text-green-400">{loading ? '...' : stats.renderedScenes}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-zinc-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => router.push('/characters')}
            className="bg-cyan-700 hover:bg-cyan-600 transition-colors px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add New Character
          </button>
          <button
            onClick={() => router.push('/models')}
            className="bg-cyan-700 hover:bg-cyan-600 transition-colors px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload 3D Asset
          </button>
          <button
            onClick={() => router.push('/shots')}
            className="bg-cyan-700 hover:bg-cyan-600 transition-colors px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Create Scene
          </button>
        </div>
      </div>

      {/* Data Sync */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3">Data Sync (Device Transfer)</h3>
        <p className="text-zinc-400 text-sm mb-3">Export all data to transfer to another device, or import from a backup file.</p>
        <div className="flex gap-3">
          <button
            onClick={handleExportAll}
            className="bg-purple-700 hover:bg-purple-600 transition-colors px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export All Data
          </button>
          <button
            onClick={handleImportAll}
            className="bg-amber-700 hover:bg-amber-600 transition-colors px-4 py-2 rounded text-sm flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Import Data
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-zinc-300">Project initialized with seed data</p>
            <span className="text-zinc-500 ml-auto">Just now</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-zinc-300">4 sample characters added to vault</p>
            <span className="text-zinc-500 ml-auto">Just now</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <p className="text-zinc-300">Book 1: Earth Prime Awakening created</p>
            <span className="text-zinc-500 ml-auto">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
