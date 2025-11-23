import React from 'react';
import { DesignLayer, TextLayer } from '../types';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#334155', '#94A3B8',
  '#DC2626', '#EA580C', '#D97706', '#65A30D',
  '#059669', '#0891B2', '#2563EB', '#4F46E5',
  '#7C3AED', '#C026D3', '#DB2777', '#E11D48'
];

interface PropertiesPanelProps {
  selectedLayer: DesignLayer | null;
  onChange: (updates: Partial<DesignLayer>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedLayer, onChange }) => {
  if (!selectedLayer) {
    return (
      <div className="w-64 bg-slate-900 border-l border-slate-800 p-6 text-slate-500 text-sm flex flex-col items-center justify-center text-center h-full">
        <p>Select an element on the canvas to edit properties.</p>
      </div>
    );
  }

  return (
    <div className="w-64 bg-slate-900 border-l border-slate-800 p-6 h-full overflow-y-auto">
      <h3 className="text-slate-200 font-semibold mb-4 uppercase text-xs tracking-wider">
        {selectedLayer.type === 'text' ? 'Text Properties' : 'Image Properties'}
      </h3>

      <div className="space-y-6">
        {/* Position Controls */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Position</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-600 mb-1 uppercase">X</label>
              <input
                type="number"
                value={Math.round(selectedLayer.x)}
                onChange={(e) => onChange({ x: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-600 mb-1 uppercase">Y</label>
              <input
                type="number"
                value={Math.round(selectedLayer.y)}
                onChange={(e) => onChange({ y: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-2">Rotation: {Math.round(selectedLayer.rotation || 0)}°</label>
          <input
            type="range"
            min="0"
            max="360"
            value={Math.round(selectedLayer.rotation) || 0}
            onChange={(e) => onChange({ rotation: Number(e.target.value) })}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {selectedLayer.type === 'text' && (
          <>
            <div className="border-t border-slate-800 pt-4">
              <label className="block text-xs text-slate-500 mb-2">Text Content</label>
              <textarea
                value={(selectedLayer as TextLayer).text}
                onChange={(e) => onChange({ text: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none resize-none h-24 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Font Size</label>
                    <input
                        type="number"
                        value={(selectedLayer as TextLayer).fontSize}
                        onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                </div>
                 <div>
                   <label className="block text-xs text-slate-500 mb-1">Font</label>
                   <select 
                     value={(selectedLayer as TextLayer).fontFamily}
                     onChange={(e) => onChange({ fontFamily: e.target.value })}
                     className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                   >
                     <option value="Inter">Inter</option>
                     <option value="Arial">Arial</option>
                     <option value="Times New Roman">Times</option>
                     <option value="Courier New">Courier</option>
                     <option value="Verdana">Verdana</option>
                     <option value="Georgia">Georgia</option>
                     <option value="Comic Sans MS">Comic</option>
                   </select>
                </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-2">Color</label>
              
              {/* Custom Color Input */}
              <div className="flex gap-2 mb-3">
                <div className="relative w-9 h-9 overflow-hidden rounded-md border border-slate-600 shrink-0">
                  <input
                    type="color"
                    value={(selectedLayer as TextLayer).fill}
                    onChange={(e) => onChange({ fill: e.target.value })}
                    className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 cursor-pointer"
                  />
                </div>
                <input 
                  type="text"
                  value={(selectedLayer as TextLayer).fill}
                  onChange={(e) => onChange({ fill: e.target.value })}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none uppercase font-mono"
                />
              </div>

              {/* Palette Grid */}
              <div className="grid grid-cols-8 gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onChange({ fill: color })}
                    className={`w-5 h-5 rounded-[4px] border transition-transform hover:scale-110 ${
                      (selectedLayer as TextLayer).fill.toLowerCase() === color.toLowerCase() 
                        ? 'border-white ring-1 ring-white z-10' 
                        : 'border-slate-600/50 hover:border-slate-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};