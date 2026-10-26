'use client';

import { useEffect, useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { Scene, Book, Chapter } from '@/lib/types';

export default function BlenderPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/scenes').then(res => res.json()),
      fetch('/api/books').then(res => res.json()),
      fetch('/api/chapters').then(res => res.json()),
    ]).then(([scenesData, booksData, chaptersData]) => {
      setScenes(scenesData);
      setBooks(booksData);
      setChapters(chaptersData);
      setLoading(false);
    });
  }, []);

  const generatePythonScript = () => {
    const selectedScenes = scenes.filter(s => selectedSceneIds.has(s.id));
    
    if (selectedScenes.length === 0) {
      return '# Select scenes to generate script';
    }

    let script = `import bpy\n\n# Scene Setup Script generated from WA & SPV\n\n`;
    
    selectedScenes.forEach((scene, index) => {
      const book = books.find(b => b.id === scene.bookId);
      const chapter = chapters.find(c => c.id === scene.chapterId);
      
      script += `# Scene ${index + 1}: ${scene.title}\n`;
      script += `# Book ${book?.number} - Chapter ${chapter?.chapterNumber}\n\n`;
      
      script += `def create_scene_collection_${index}(scene_name):\n`;
      script += `    collection = bpy.data.collections.new(scene_name)\n`;
      script += `    bpy.context.scene.collection.children.link(collection)\n`;
      script += `    return collection\n\n`;
      
      script += `def setup_lighting_${index}():\n`;
      script += `    world = bpy.data.worlds.new("SceneWorld_${index}")\n`;
      script += `    bpy.context.scene.world = world\n`;
      script += `    world.use_nodes = True\n\n`;
      
      script += `def add_camera_${index}(location, rotation, focal_length):\n`;
      script += `    camera_data = bpy.data.cameras.new("SceneCamera_${index}")\n`;
      script += `    camera_data.lens = focal_length\n`;
      script += `    camera_obj = bpy.data.objects.new("SceneCamera_${index}", camera_data)\n`;
      script += `    bpy.context.scene.collection.objects.link(camera_obj)\n`;
      script += `    camera_obj.location = location\n`;
      script += `    camera_obj.rotation_euler = rotation\n\n`;
      
      script += `# Main execution for scene ${index + 1}\n`;
      script += `scene_collection = create_scene_collection_${index}("${scene.title.replace(/\s+/g, '_')}")\n`;
      script += `setup_lighting_${index}()\n`;
      script += `add_camera_${index}(location=(0, -10, 2), rotation=(0.3, 0, 0), focal_length=35)\n\n`;
      script += `# Characters: ${scene.characterIds.join(', ') || 'None'}\n`;
      script += `# Environment: ${scene.environmentId || 'None'}\n`;
      script += `# Camera Shot: ${scene.cameraShotType || 'Not specified'}\n`;
      script += `# Dialogue: ${scene.dialogue || 'None'}\n\n`;
      script += `---\n\n`;
    });
    
    return script;
  };

  const toggleScene = (sceneId: string) => {
    const newSelected = new Set(selectedSceneIds);
    if (newSelected.has(sceneId)) {
      newSelected.delete(sceneId);
    } else {
      newSelected.add(sceneId);
    }
    setSelectedSceneIds(newSelected);
  };

  const copyToClipboard = () => {
    const script = generatePythonScript();
    navigator.clipboard.writeText(script);
  };

  const downloadScript = () => {
    const script = generatePythonScript();
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup_scene.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Blender Python Script Exporter</h2>
          <p className="text-zinc-400 text-sm">Generate setup_scene.py for Blender</p>
        </div>
      </div>

      {/* Scene Selection */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3">Select Scenes to Export</h3>
        {scenes.length === 0 ? (
          <p className="text-zinc-500 text-sm">No scenes available. Create scenes in the Shot List first.</p>
        ) : (
          <div className="space-y-2">
            {scenes.map((scene) => {
              const book = books.find(b => b.id === scene.bookId);
              const chapter = chapters.find(c => c.id === scene.chapterId);
              return (
                <label
                  key={scene.id}
                  className="flex items-center gap-3 p-2 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSceneIds.has(scene.id)}
                    onChange={() => toggleScene(scene.id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm">
                    {scene.title} (Book {book?.number} - Chapter {chapter?.chapterNumber})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Generated Script Preview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="bg-zinc-800 p-3 border-b border-zinc-700 flex items-center justify-between">
          <span className="text-sm font-medium">setup_scene.py</span>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="text-xs px-3 py-1 bg-zinc-700 rounded hover:bg-zinc-600 flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
            <button
              onClick={downloadScript}
              className="bg-cyan-700 hover:bg-cyan-600 text-xs px-3 py-1 rounded flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        </div>
        <div className="p-4 bg-zinc-950 text-sm font-mono text-zinc-300 overflow-x-auto max-h-96 overflow-y-auto">
          <pre>{generatePythonScript()}</pre>
        </div>
      </div>
    </div>
  );
}
