import { Routes, Route } from "react-router-dom";
import React from "react";
import UrlShortner from "./components/UrlShortner";
import Navbar from "./components/Navbar";
import CheckSeo from "./components/CheckSeo";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<UrlShortner />} />
        <Route path="/checkseo" element={<CheckSeo />} />
      </Routes>
    </>
  );
}

export default App;
