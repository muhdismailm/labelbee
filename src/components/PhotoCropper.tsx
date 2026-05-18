"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RefreshCw } from 'lucide-react';

interface Point { x: number; y: number }
interface Area { x: number; y: number; width: number; height: number }

interface Props {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

// Bounding box size calculator after rotation
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export default function PhotoCropper({ imageUrl, onCropComplete, onCancel }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // Added for photo tilting/rotation
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area, rotationValue: number = 0): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    const rotRad = (rotationValue * Math.PI) / 180;
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotationValue);

    // Set canvas dimensions to fit the rotated bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Draw the image rotated
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    // Get the cropped imageData from the rotated context
    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    );

    // Resize canvas to final cropped size and output image
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.putImageData(data, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleSave = async () => {
    if (croppedAreaPixels) {
      try {
        const croppedUrl = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
        onCropComplete(croppedUrl);
      } catch (err) {
        console.error("Error cropping image:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Edit Photo</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Live Cropper view */}
        <div className="relative w-full h-[320px] bg-slate-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={4 / 5} // Portrait aspect ratio typical for student photos
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>
        
        <div className="p-5 space-y-4">
          {/* Zoom Control */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              <span>Zoom</span>
              <span className="font-bold text-slate-700">{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Rotation/Tilt Control */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 text-indigo-500" /> Tilt / Rotate</span>
              <span className="font-bold text-slate-700">{rotation}°</span>
            </div>
            <input
              type="range"
              value={rotation}
              min={-180}
              max={180}
              step={1}
              aria-labelledby="Rotate"
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
