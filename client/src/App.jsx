import { Routes, Route } from "react-router-dom";
import React from "react";
import UrlShortner from "./components/UrlShortner";
import Navbar from "./components/Navbar";
import CheckSeo from "./components/CheckSeo";
import ColorPicker from "./components/ColorPicker";
import SSLchecker from "./components/SSlchecker";
// import useKeepAlive from "./hooks/KeepAlive";

function App() {
  // const endpoints = [
  //   'https://url-shortner-2kza.onrender.com/api/seo/check',
  //   'https://url-shortner-2kza.onrender.com/api/shorten'
  // ];

  // useKeepAlive(endpoints);
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<UrlShortner />} />
        <Route path="/checkseo" element={<CheckSeo />} />
        <Route path="/colorpicker" element={<ColorPicker />} />
        <Route path="/ssl" element={<SSLchecker />} />
      </Routes>
    </>
  );
}

export default App;
