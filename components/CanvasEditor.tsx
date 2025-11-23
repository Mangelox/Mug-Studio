import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Transformer, Rect } from 'react-konva';
import useImage from 'use-image';
import { DesignLayer, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types';
import Konva from 'konva';

interface CanvasEditorProps {
  layers: DesignLayer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (newLayers: DesignLayer[]) => void;
  onUpdatePreview: (dataUrl: string) => void;
}

const URLImage = ({ layer, isSelected, onSelect, onChange }: { 
  layer: any, 
  isSelected: boolean, 
  onSelect: () => void,
  onChange: (newAttrs: any) => void 
}) => {
  const [image] = useImage(layer.src, 'anonymous');
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        image={image}
        {...layer}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...layer,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...layer,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const TextObj = ({ layer, isSelected, onSelect, onChange }: {
  layer: any,
  isSelected: boolean,
  onSelect: () => void,
  onChange: (newAttrs: any) => void
}) => {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...layer}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...layer,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...layer,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: node.fontSize() * scaleY, 
            scaleX: 1,
            scaleY: 1,
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
             if (newBox.width < 5 || newBox.height < 5) return oldBox;
             return newBox;
          }}
        />
      )}
    </>
  );
};

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  layers,
  selectedId,
  onSelect,
  onChange,
  onUpdatePreview
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const bgLayerRef = useRef<Konva.Layer>(null);

  // Function to capture the stage as a data URL for the 3D texture
  const updatePreview = React.useCallback(() => {
    if (stageRef.current) {
      // Hide transformer before snapshot if needed, but for now keep it simple
      // We might want to deselect momentarily to capture clean image
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      onUpdatePreview(uri);
    }
  }, [onUpdatePreview]);

  // Update preview whenever layers change, debounced slightly
  useEffect(() => {
    const timeout = setTimeout(updatePreview, 500);
    return () => clearTimeout(timeout);
  }, [layers, updatePreview]);

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    const clickedOnBg = e.target.attrs.id === 'bg-rect';
    if (clickedOnEmpty || clickedOnBg) {
      onSelect(null);
    }
  };

  // Calculate scale to fit in the UI container
  // Canvas is ~870px wide. Container might be smaller.
  // We'll use a CSS transform in the parent or just fixed size here.
  // For simplicity, we render at 100% but rely on CSS scale for view.
  
  return (
    <div className="relative shadow-2xl bg-white overflow-hidden select-none" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        <Stage
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
          className="bg-white"
        >
          <Layer ref={bgLayerRef}>
            {/* Background White Canvas */}
            <Rect
                id="bg-rect"
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                fill="white"
            />
            {layers.map((layer, i) => {
              if (layer.type === 'image') {
                return (
                  <URLImage
                    key={layer.id}
                    layer={layer}
                    isSelected={layer.id === selectedId}
                    onSelect={() => onSelect(layer.id)}
                    onChange={(newAttrs) => {
                      const newLayers = layers.slice();
                      newLayers[i] = newAttrs;
                      onChange(newLayers);
                    }}
                  />
                );
              }
              return (
                <TextObj
                  key={layer.id}
                  layer={layer}
                  isSelected={layer.id === selectedId}
                  onSelect={() => onSelect(layer.id)}
                  onChange={(newAttrs) => {
                    const newLayers = layers.slice();
                    newLayers[i] = newAttrs;
                    onChange(newLayers);
                  }}
                />
              );
            })}
          </Layer>
        </Stage>
    </div>
  );
};
