import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">
          <Link to="/"> Super Utility</Link>
        </div>
        <div className="flex space-x-4">
          <Link
            to="/"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            URL Shortner
          </Link>
          <Link
            to="/checkseo"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            SEO Checker
          </Link>
          <Link
            to="/colorpicker"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            Color Picker
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
