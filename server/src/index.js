import express from "express";
import multer from "multer";
import sharp from "sharp";
import cors from "cors";
import fs from "fs";



const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// Ensure upload & output directories exist
const uploadDir = "./uploads";
const resizedDir = "./resized";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(resizedDir)) fs.mkdirSync(resizedDir);

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Resize function
const resizeImage = async (filePath, width, height, outputName) => {
  const outputPath = `${resizedDir}/${outputName}`;
  await sharp(filePath).resize(width, height).toFile(outputPath);
  return outputPath;
};


// API: Upload & resize image
app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const { path, filename } = req.file;
    const sizes = [
      { width: 300, height: 250, name: `300x250-${filename}` },
      { width: 728, height: 90, name: `728x90-${filename}` },
      { width: 160, height: 600, name: `160x600-${filename}` },
      { width: 300, height: 600, name: `300x600-${filename}` },
    ];

    const resizedImages = await Promise.all(
      sizes.map((size) => resizeImage(path, size.width, size.height, size.name))
    );

    res.json({
      message: "Images resized successfully!",
      images: resizedImages.map((img) => `http://localhost:${PORT}/${img}`),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image processing error" });
  }
});

import path from "path";
const __dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
  });
}

// Serve resized images
app.use("/resized", express.static(resizedDir));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

