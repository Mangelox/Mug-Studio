export interface Layer {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  draggable: boolean;
}

export interface TextLayer extends Layer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: string;
}

export interface ImageLayer extends Layer {
  type: 'image';
  src: string;
  width?: number;
  height?: number;
}

export type DesignLayer = TextLayer | ImageLayer;

export interface CanvasConfig {
  width: number;
  height: number;
  pixelRatio: number;
}

// Constants for the physical mug dimensions
export const MUG_HEIGHT_CM = 9.5;
export const MUG_CIRCUMFERENCE_CM = 23;
export const PPI = 96; // Pixels per inch
export const CM_TO_INCH = 0.393701;
export const PIXELS_PER_CM = PPI * CM_TO_INCH; // ~37.8 px/cm

export const CANVAS_WIDTH = Math.round(MUG_CIRCUMFERENCE_CM * PIXELS_PER_CM); // ~870px
export const CANVAS_HEIGHT = Math.round(MUG_HEIGHT_CM * PIXELS_PER_CM); // ~360px
