import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import { GridFSBucket, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let gfs;
const conn = mongoose.connection;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    gfs = new GridFSBucket(conn.db, { bucketName: "models" });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Model metadata schema
const ModelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    tags: [{ type: String }],
    thumbnail: { type: String, default: "" },
  },
  { timestamps: true }
);

const Model3D = mongoose.model("Model3D", ModelSchema);

// Multer memory storage for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "model/gltf-binary" ||
      file.originalname.endsWith(".glb")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .glb files are allowed"), false);
    }
  },
});

// ===================== API ROUTES =====================

// GET /api/models — List all models
app.get("/api/models", async (req, res) => {
  try {
    const models = await Model3D.find().sort({ createdAt: -1 });
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/models/:id — Get single model metadata
app.get("/api/models/:id", async (req, res) => {
  try {
    const model = await Model3D.findById(req.params.id);
    if (!model) return res.status(404).json({ error: "Model not found" });
    res.json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/models/:id/file — Stream the GLB file from GridFS
app.get("/api/models/:id/file", async (req, res) => {
  try {
    const model = await Model3D.findById(req.params.id);
    if (!model) return res.status(404).json({ error: "Model not found" });

    res.set("Content-Type", "model/gltf-binary");
    res.set(
      "Content-Disposition",
      `inline; filename="${model.fileName}"`
    );

    const downloadStream = gfs.openDownloadStream(model.fileId);
    downloadStream.on("error", (err) => {
      res.status(404).json({ error: "File not found in storage" });
    });
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/models — Upload a new GLB model
app.post("/api/models", upload.single("model"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name, description, tags } = req.body;

    // Upload file buffer to GridFS
    const uploadStream = gfs.openUploadStream(req.file.originalname, {
      contentType: "model/gltf-binary",
    });

    // Write buffer and close
    await new Promise((resolve, reject) => {
      uploadStream.end(req.file.buffer, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Create metadata record
    const model = await Model3D.create({
      name: name || req.file.originalname.replace(".glb", ""),
      description: description || "",
      fileId: uploadStream.id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      tags: tags ? JSON.parse(tags) : [],
    });

    res.status(201).json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/models/:id — Delete a model and its file
app.delete("/api/models/:id", async (req, res) => {
  try {
    const model = await Model3D.findById(req.params.id);
    if (!model) return res.status(404).json({ error: "Model not found" });

    // Delete file from GridFS
    await gfs.delete(model.fileId);

    // Delete metadata
    await Model3D.findByIdAndDelete(req.params.id);

    res.json({ message: "Model deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/models/:id — Update model metadata
app.patch("/api/models/:id", async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (tags !== undefined) update.tags = tags;

    const model = await Model3D.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!model) return res.status(404).json({ error: "Model not found" });

    res.json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 100MB." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
