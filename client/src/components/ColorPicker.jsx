import React, { useState, useEffect } from "react";
import axios from "axios";

const colorNames = {
  "#FF0000": "Red",
  "#00FF00": "Green",
  "#0000FF": "Blue",
  "#FFFF00": "Yellow",
  "#FF00FF": "Magenta",
  "#00FFFF": "Cyan",
  "#FFA500": "Orange",
  "#800080": "Purple",
  "#FFC0CB": "Pink",
  "#A52A2A": "Brown",
};

function ColorPicker() {
  const [color, setColor] = useState("#000000");
  const [rgb, setRgb] = useState("rgb(0, 0, 0)");
  const [hsl, setHsl] = useState("hsl(0, 0%, 0%)");
  const [palette, setPalette] = useState([]);
  const [colorName, setColorName] = useState("");
  const [colorHistory, setColorHistory] = useState([]);
  const [gradientColor, setGradientColor] = useState("#ffffff");
  const [gradientType, setGradientType] = useState("linear");
  const [gradientColors, setGradientColors] = useState([
    { color: "#ffffff", stop: 0 },
    { color: "#000000", stop: 100 },
  ]);
  const [gradientAngle, setGradientAngle] = useState(90);
  const [radialPosition, setRadialPosition] = useState({ x: 50, y: 50 });
  const [previewSize, setPreviewSize] = useState({ width: 300, height: 150 });

  useEffect(() => {
    const storedHistory =
      JSON.parse(localStorage.getItem("colorHistory")) || [];
    setColorHistory(storedHistory);
  }, []);

  useEffect(() => {
    generatePalette();
    suggestColorName();
  }, [color]);

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    updateColorValues(newColor);
    addToHistory(newColor);
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
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNormalized:
          h =
            (gNormalized - bNormalized) / d +
            (gNormalized < bNormalized ? 6 : 0);
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

    setHsl(
      `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(
        l * 100
      )}%)`
    );
  };

  const generatePalette = () => {
    const baseHue = parseInt(hsl.match(/hsl\((\d+),/)[1]);
    const newPalette = [
      `hsl(${baseHue}, 100%, 90%)`,
      `hsl(${baseHue}, 100%, 70%)`,
      `hsl(${baseHue}, 100%, 50%)`,
      `hsl(${baseHue}, 100%, 30%)`,
      `hsl(${baseHue}, 100%, 10%)`,
    ];
    setPalette(newPalette);
  };

  const calculateContrastRatio = (color1, color2) => {
    const luminance = (r, g, b) => {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };
  
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
  
    const [r1, g1, b1] = hexToRgb(color1);
    const l1 = luminance(r1, g1, b1);
    const l2 = color2 === '#ffffff' ? 1 : 0;
  
    const ratio = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
    return ratio.toFixed(2);
  };

  const suggestColorName = () => {
    const closestColor = Object.keys(colorNames).reduce((a, b) => {
      const diffA = Math.abs(parseInt(a.slice(1), 16) - parseInt(color.slice(1), 16));
      const diffB = Math.abs(parseInt(b.slice(1), 16) - parseInt(color.slice(1), 16));
      return diffA < diffB ? a : b;
    });
    setColorName(colorNames[closestColor]);
  };

  const addToHistory = (newColor) => {
    const newHistory = [
      newColor,
      ...colorHistory.filter((c) => c !== newColor),
    ].slice(0, 10);
    setColorHistory(newHistory);
    localStorage.setItem("colorHistory", JSON.stringify(newHistory));
  };

  const generateGradient = () => {
    const colorStops = gradientColors
      .map((c) => `${c.color} ${c.stop}%`)
      .join(", ");

    if (gradientType === "linear") {
      return `linear-gradient(${gradientAngle}deg, ${colorStops})`;
    } else {
      const { x, y } = radialPosition;
      return `radial-gradient(circle at ${x}% ${y}%, ${colorStops})`;
    }
  };

  const addColorStop = () => {
    setGradientColors([
      ...gradientColors,
      { color: "#000000", stop: 100 },
    ]);
  };

  const updateColorStop = (index, field, value) => {
    const updatedColors = [...gradientColors];
    updatedColors[index][field] = value;
    setGradientColors(updatedColors);
  };

  const removeColorStop = (index) => {
    if (gradientColors.length > 2) {
      const updatedColors = gradientColors.filter((_, i) => i !== index);
      setGradientColors(updatedColors);
    }
  };

  const copyGradientCSS = () => {
    const css = `background: ${generateGradient()};`;
    navigator.clipboard.writeText(css).then(() => {
      alert("Gradient CSS copied to clipboard!");
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Color Picker & Converter
        </h1>

        <div className="mb-6">
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="w-full h-16 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              HEX:
            </label>
            <input
              type="text"
              value={color}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              RGB:
            </label>
            <input
              type="text"
              value={rgb}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              HSL:
            </label>
            <input
              type="text"
              value={hsl}
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Color Palette</h2>
          <div className="flex space-x-2">
            {palette.map((color, index) => (
              <div
                key={index}
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: color }}
                title={color}
              ></div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Contrast Ratio</h2>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded flex items-center justify-center mr-2"
                style={{ backgroundColor: color }}
              >
                <span className="text-white font-bold">A</span>
              </div>
              <span>
                White text: {calculateContrastRatio(color, "#ffffff")}
              </span>
            </div>
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded flex items-center justify-center mr-2"
                style={{ backgroundColor: color }}
              >
                <span className="text-black font-bold">A</span>
              </div>
              <span>
                Black text: {calculateContrastRatio(color, "#000000")}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <span className="font-semibold">Suggested name: </span>
          <span>{colorName}</span>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Color History</h2>
          <div className="flex flex-wrap gap-2">
            {colorHistory.map((c, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded cursor-pointer"
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                title={c}
              ></div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Gradient Generator</h2>
          <div className="flex flex-col space-y-4 mb-4">
            <div className="flex items-center space-x-4">
              <select
                value={gradientType}
                onChange={(e) => setGradientType(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
              {gradientType === "linear" ? (
                <div className="flex items-center space-x-2">
                  <label>Angle:</label>
                  <input
                    type="number"
                    value={gradientAngle}
                    onChange={(e) => setGradientAngle(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-16"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <label>Center:</label>
                  <input
                    type="number"
                    value={radialPosition.x}
                    onChange={(e) =>
                      setRadialPosition({ ...radialPosition, x: Number(e.target.value) })
                    }
                    className="border rounded px-2 py-1 w-16"
                  />
                  <input
                    type="number"
                    value={radialPosition.y}
                    onChange={(e) =>
                      setRadialPosition({ ...radialPosition, y: Number(e.target.value) })
                    }
                    className="border rounded px-2 py-1 w-16"
                  />
                </div>
              )}
            </div>
            {gradientColors.map((colorStop, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="color"
                  value={colorStop.color}
                  onChange={(e) => updateColorStop(index, "color", e.target.value)}
                  className="w-8 h-8 cursor-pointer"
                />
                <input
                  type="number"
                  value={colorStop.stop}
                  onChange={(e) => updateColorStop(index, "stop", Number(e.target.value))}
                  className="border rounded px-2 py-1 w-16"
                />
                {gradientColors.length > 2 && (
                  <button
                    onClick={() => removeColorStop(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addColorStop}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Color Stop
            </button>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Preview Size:</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={previewSize.width}
                onChange={(e) =>
                  setPreviewSize({ ...previewSize, width: Number(e.target.value) })
                }
                className="border rounded px-2 py-1 w-20"
              />
              <span>x</span>
              <input
                type="number"
                value={previewSize.height}
                onChange={(e) =>
                  setPreviewSize({ ...previewSize, height: Number(e.target.value) })
                }
                className="border rounded px-2 py-1 w-20"
              />
            </div>
          </div>
          <div
            className="rounded mb-4"
            style={{
              background: generateGradient(),
              width: `${previewSize.width}px`,
              height: `${previewSize.height}px`,
            }}
          ></div>
          <button
            onClick={copyGradientCSS}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Copy Gradient CSS
          </button>
        </div>
      </div>
    </div>
  );
}

export default ColorPicker;
