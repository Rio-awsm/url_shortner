import { Routes, Route } from "react-router-dom";
import React from "react";
import UrlShortner from "./components/UrlShortner";
import Navbar from "./components/Navbar";
import CheckSeo from "./components/CheckSeo";
import ColorPicker from "./components/ColorPicker";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<UrlShortner />} />
        <Route path="/checkseo" element={<CheckSeo />} />
        <Route path="/colorpicker" element={<ColorPicker />} />
      </Routes>
    </>
  );
}

export default App;
