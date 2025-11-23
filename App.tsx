import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CanvasEditor } from './components/CanvasEditor';
import { MugViewer } from './components/MugViewer';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { DesignLayer, TextLayer, ImageLayer, CANVAS_WIDTH, CANVAS_HEIGHT } from './types';
import { generateDesignImage } from './services/geminiService';
import { Loader2, X, Wand2 } from 'lucide-react';

const App: React.FC = () => {
  const [layers, setLayers] = useState<DesignLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // AI Gen State
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleAddText = () => {
    const newLayer: TextLayer = {
      id: uuidv4(),
      type: 'text',
      text: 'Double Click to Edit',
      fontSize: 24,
      fontFamily: 'Inter',
      fill: '#000000',
      x: CANVAS_WIDTH / 2 - 100,
      y: CANVAS_HEIGHT / 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      draggable: true,
      align: 'center'
    };
    setLayers([...layers, newLayer]);
    setSelectedId(newLayer.id);
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (res) => {
        const imgObj = new Image();
        imgObj.src = res.target?.result as string;
        imgObj.onload = () => {
            // Scale down if too big
            let w = imgObj.width;
            let h = imgObj.height;
            const maxDim = 300;
            if (w > maxDim || h > maxDim) {
                const ratio = Math.min(maxDim / w, maxDim / h);
                w *= ratio;
                h *= ratio;
            }

            const newLayer: ImageLayer = {
              id: uuidv4(),
              type: 'image',
              src: res.target?.result as string,
              x: CANVAS_WIDTH / 2 - w/2,
              y: CANVAS_HEIGHT / 2 - h/2,
              width: w,
              height: h,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
              draggable: true,
            };
            setLayers([...layers, newLayer]);
            setSelectedId(newLayer.id);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setShowPromptModal(false);

    try {
      const dataUrl = await generateDesignImage(prompt);
      if (dataUrl) {
        const newLayer: ImageLayer = {
          id: uuidv4(),
          type: 'image',
          src: dataUrl,
          x: 50,
          y: 50,
          width: 250,
          height: 250,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          draggable: true,
        };
        setLayers([...layers, newLayer]);
        setSelectedId(newLayer.id);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate image');
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleDelete = useCallback(() => {
    if (selectedId) {
      setLayers(layers.filter(l => l.id !== selectedId));
      setSelectedId(null);
    }
  }, [selectedId, layers]);

  const handleLayerUpdate = (updatedLayer: Partial<DesignLayer>) => {
    setLayers(layers.map(l => l.id === selectedId ? { ...l, ...updatedLayer } as DesignLayer : l));
  };

  const selectedLayer = layers.find(l => l.id === selectedId) || null;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* Toolbar */}
      <Toolbar 
        onAddText={handleAddText} 
        onAddImage={handleAddImage} 
        onGenerateImage={() => setShowPromptModal(true)}
        onDelete={handleDelete}
        hasSelection={!!selectedId}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6 justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Mug Studio Pro</h1>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Canvas: 23cm x 9.5cm</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            <span>300 DPI Preview</span>
          </div>
        </div>

        {/* Editors Split View */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: 2D Canvas Editor */}
          <div className="flex-1 bg-slate-900/50 p-8 overflow-auto flex flex-col items-center justify-center relative">
             <div className="mb-4 text-slate-400 text-sm font-medium">2D Layout Editor</div>
             
             <div className="border-4 border-white shadow-2xl">
               {/* 
                 We scale the editor visually to fit, but logic keeps real size.
                 CSS transform scale is a simple way to handle responsive preview.
               */}
               <div style={{ transform: 'scale(0.75)', transformOrigin: 'top center' }}>
                 <CanvasEditor 
                    layers={layers} 
                    selectedId={selectedId} 
                    onSelect={setSelectedId} 
                    onChange={setLayers}
                    onUpdatePreview={setPreviewUrl}
                 />
               </div>
             </div>
             <div className="mt-4 text-xs text-slate-500">
                Changes sync automatically to 3D view
             </div>
          </div>

          {/* Center/Right: 3D Preview */}
          <div className="flex-1 bg-slate-800 border-l border-slate-700 relative">
            <MugViewer textureUrl={previewUrl} />
            {isGenerating && (
                <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center flex-col gap-4">
                    <Loader2 className="animate-spin text-indigo-400" size={48} />
                    <p className="text-indigo-200 font-medium">Generating AI Asset...</p>
                </div>
            )}
          </div>

          {/* Right: Properties */}
          <PropertiesPanel selectedLayer={selectedLayer} onChange={handleLayerUpdate} />

        </div>
      </div>

      {/* Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Generate Image Asset</h3>
              <button onClick={() => setShowPromptModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <textarea 
              autoFocus
              placeholder="Describe the image you want (e.g., 'Cute cat pattern', 'Vintage floral design')..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32 mb-4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowPromptModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateImage}
                disabled={!prompt.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Wand2 size={16} />
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;