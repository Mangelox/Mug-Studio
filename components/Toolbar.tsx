import React from 'react';
import { Type, Image as ImageIcon, Download, Wand2, Trash2, MousePointer2 } from 'lucide-react';

interface ToolbarProps {
  onAddText: () => void;
  onAddImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateImage: () => void;
  onDelete: () => void;
  hasSelection: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddText,
  onAddImage,
  onGenerateImage,
  onDelete,
  hasSelection
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900 border-r border-slate-800 w-20 items-center h-full z-20">
      <div className="mb-4 text-slate-400">
        <MousePointer2 size={24} />
      </div>
      
      <button 
        onClick={onAddText}
        className="p-3 bg-slate-800 hover:bg-indigo-600 rounded-xl text-white transition-colors tooltip group relative"
        title="Add Text"
      >
        <Type size={20} />
        <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">Add Text</span>
      </button>

      <label className="p-3 bg-slate-800 hover:bg-indigo-600 rounded-xl text-white transition-colors cursor-pointer group relative">
        <ImageIcon size={20} />
        <input type="file" className="hidden" accept="image/*" onChange={onAddImage} />
        <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">Upload Image</span>
      </label>

      <button 
        onClick={onGenerateImage}
        className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-white transition-all shadow-lg group relative"
        title="Generate AI Image"
      >
        <Wand2 size={20} />
        <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">AI Generate</span>
      </button>

      <div className="flex-1" />

      <button 
        onClick={onDelete}
        disabled={!hasSelection}
        className={`p-3 rounded-xl transition-colors ${hasSelection ? 'bg-red-900/50 text-red-400 hover:bg-red-600 hover:text-white' : 'bg-slate-900 text-slate-700 cursor-not-allowed'}`}
        title="Delete Selected"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};
