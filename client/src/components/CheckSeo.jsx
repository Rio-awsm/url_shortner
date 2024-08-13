import React, { useState } from "react";
import axios from "axios";

function CheckSeo() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("https://url-shortner-2kza.onrender.com/api/seo/check", {
        url,
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error checking SEO:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-2xl font-semibold mb-4">SEO Score Checker</h1>
          <form onSubmit={handleSubmit} className="mb-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Checking..." : "Check SEO"}
            </button>
          </form>
          {result && (
            <div>
              <h2 className="text-xl font-semibold mb-2">
                SEO Analysis Results:
              </h2>
              <p className="text-2xl font-bold mb-4">
                Score: {result.score}/{result.maxScore}
              </p>

              <h3 className="text-lg font-semibold mt-4">Title:</h3>
              <p>{result.details.title.content}</p>
              <p>
                Length: {result.details.title.length}, Score:{" "}
                {result.details.title.score.toFixed(1)}/10
              </p>

              <h3 className="text-lg font-semibold mt-4">Meta Description:</h3>
              <p>{result.details.description.content}</p>
              <p>
                Length: {result.details.description.length}, Score:{" "}
                {result.details.description.score.toFixed(1)}/10
              </p>

              <h3 className="text-lg font-semibold mt-4">Headers:</h3>
              {["h1", "h2", "h3"].map((tag) => (
                <p key={tag}>
                  {tag.toUpperCase()}: {result.details.headers[tag].count}{" "}
                  (Score: {result.details.headers[tag].score}/10)
                </p>
              ))}

              <h3 className="text-lg font-semibold mt-4">Images:</h3>
              <p>
                Total: {result.details.images.total}, With Alt:{" "}
                {result.details.images.withAlt}, Lazy Loading:{" "}
                {result.details.images.withLazyLoading}
              </p>
              <p>Score: {result.details.images.score.toFixed(1)}/10</p>

              <h3 className="text-lg font-semibold mt-4">Links:</h3>
              <p>
                Internal: {result.details.links.internal}, External:{" "}
                {result.details.links.external}
              </p>
              <p>Score: {result.details.links.score.toFixed(1)}/10</p>

              <h3 className="text-lg font-semibold mt-4">URL Structure:</h3>
              <p>
                Length: {result.details.url.length}, Includes Keywords:{" "}
                {result.details.url.includesKeywords ? "Yes" : "No"}
              </p>
              <p>Score: {result.details.url.score}/10</p>

              <h3 className="text-lg font-semibold mt-4">
                Mobile Responsiveness:
              </h3>
              <p>
                {result.details.mobileResponsive.hasViewport
                  ? "Responsive"
                  : "Not Responsive"}
              </p>
              <p>Score: {result.details.mobileResponsive.score}/10</p>

              <h3 className="text-lg font-semibold mt-4">SSL Certificate:</h3>
              <p>{result.details.ssl.present ? "Present" : "Not Present"}</p>
              <p>Score: {result.details.ssl.score}/10</p>

              <h3 className="text-lg font-semibold mt-4">Page Load Speed:</h3>
              <p>Load Time: {result.details.loadSpeed.time.toFixed(2)}ms</p>
              <p>Score: {result.details.loadSpeed.score.toFixed(1)}/10</p>

              <h3 className="text-lg font-semibold mt-4">Content Length:</h3>
              <p>{result.details.contentLength.length} characters</p>
              <p>Score: {result.details.contentLength.score.toFixed(1)}/10</p>

              <h3 className="text-lg font-semibold mt-4">Keyword Density:</h3>
              <ul>
                {result.details.keywordDensity.topKeywords.map((kw) => (
                  <li key={kw.word}>
                    {kw.word}: {(kw.density * 100).toFixed(2)}%
                  </li>
                ))}
              </ul>
              <p>Score: {result.details.keywordDensity.score}/5</p>

              <h3 className="text-lg font-semibold mt-4">
                Social Media Meta Tags:
              </h3>
              <p>
                Open Graph Tags: {result.details.socialMeta.ogTags}, Twitter
                Cards: {result.details.socialMeta.twitterTags}
              </p>
              <p>Score: {result.details.socialMeta.score}/5</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckSeo;
