import { useState } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage("");
    setImages([]);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Image resized successfully!");
      setImages(response.data.images);
    } catch (error) {
      setMessage("Failed to upload image");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Upload & Resize Image</h2>
        <input type="file" onChange={handleFileChange} className="border p-2 w-full rounded" />
        <button
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition w-full"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Processing..." : "Upload & Resize"}
        </button>
        {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}

        {/* Show Resized Images */}
        <div className="mt-4">
          {images.length > 0 &&
            images.map((img, index) => (
              <div key={index} className="mt-2">
                <img src={img} alt="Resized" className="w-full h-auto border" />
                <p className="text-xs text-center mt-1">{img.split("/").pop()}</p>
                <a href={img} download className="text-blue-500 underline text-sm">
                  Download
                </a>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
