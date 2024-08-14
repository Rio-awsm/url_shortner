import React, { useState } from "react";
import axios from "axios";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaMoon, FaSun, FaSearch } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function CheckSeo() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/seo/check", { url });
      setResult(response.data);
    } catch (error) {
      console.error("Error checking SEO:", error);
    }
    setLoading(false);
  };

  const chartData = result ? {
    labels: result.chartData.map(item => item.category),
    datasets: [{
      label: 'SEO Score',
      data: result.chartData.map(item => item.score),
      backgroundColor: result.chartData.map(item => item.color),
    }]
  } : null;

  const chartOptions = {
    scales: {
      y: { beginAtZero: true, max: 10 }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">SEO Score Checker</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'}`}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL"
              className={`flex-grow px-4 py-2 rounded-l-lg focus:outline-none ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
              required
            />
            <button
              type="submit"
              className={`px-6 py-2 rounded-r-lg flex items-center ${loading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'} text-white focus:outline-none transition-colors duration-300`}
              disabled={loading}
            >
              {loading ? 'Checking...' : <><FaSearch className="mr-2" /> Check SEO</>}
            </button>
          </div>
        </form>

        {result && (
          <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">SEO Analysis Results</h2>
              <div className={`text-4xl font-bold mb-6 ${getScoreColorClass(result.score, result.maxScore)}`}>
                Score: {result.score}/{result.maxScore}
              </div>

              {chartData && <Bar data={chartData} options={chartOptions} className="mb-8" />}

              <div className="space-y-6">
                {Object.entries(result.details).map(([category, data]) => (
                  <div key={category} className="border-b pb-4">
                    <h3 className={`text-xl font-semibold mb-2 ${getScoreColorClass(data.score, data.maxScore)}`}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}: {data.score}/{data.maxScore}
                    </h3>
                    {data.content && <p className="mb-2">{data.content}</p>}
                    {data.length && <p className="mb-2">Length: {data.length}</p>}
                    {data.recommendations && (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {data.recommendations.map((rec, index) => (
                          <li key={index} className="text-red-500">{rec}</li>
                        ))}
                      </ul>
                    )}
                    {category === 'keywordDensity' && data.topKeywords && (
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {data.topKeywords.map((kw) => (
                          <li key={kw.word}>
                            {kw.word}: {(kw.density * 100).toFixed(2)}%
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getScoreColorClass(score, maxScore) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'text-green-500';
  if (percentage >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

export default CheckSeo;