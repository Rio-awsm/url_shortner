import React, { useState } from 'react';
import axios from 'axios';

function ColorPicker() {
  const [color, setColor] = useState('#000000');
  const [rgb, setRgb] = useState('rgb(0, 0, 0)');
  const [hsl, setHsl] = useState('hsl(0, 0%, 0%)');

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    updateColorValues(newColor);
  };

  const updateColorValues = (hex) => {
    // Convert HEX to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    setRgb(`rgb(${r}, ${g}, ${b})`);

    // Convert RGB to HSL
    const rNormalized = r / 255;
    const gNormalized = g / 255;
    const bNormalized = b / 255;
    const max = Math.max(rNormalized, gNormalized, bNormalized);
    const min = Math.min(rNormalized, gNormalized, bNormalized);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNormalized:
          h = (gNormalized - bNormalized) / d + (gNormalized < bNormalized ? 6 : 0);
          break;
        case gNormalized:
          h = (bNormalized - rNormalized) / d + 2;
          break;
        case bNormalized:
          h = (rNormalized - gNormalized) / d + 4;
          break;
      }
      h /= 6;
    }

    setHsl(`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
  };

  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Color Picker & Converter</h1>
        <div className="mb-6">
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="w-full h-16 cursor-pointer"
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">HEX:</label>
            <input
              type="text"
              value={color}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">RGB:</label>
            <input
              type="text"
              value={rgb}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">HSL:</label>
            <input
              type="text"
              value={hsl}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ColorPicker;