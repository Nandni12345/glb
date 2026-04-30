import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Upload, FileBox, X, Check } from "lucide-react";
import { api } from "../services/api";
import ModelViewer from "../components/ModelViewer";
import toast from "react-hot-toast";

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      setName(f.name.replace(/\.glb$/i, ""));
      // Create a local object URL for preview
      const url = URL.createObjectURL(f);
      setFilePreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/gltf-binary": [".glb"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a GLB file");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      await api.uploadModel(file, { name, description, tags }, (p) => setProgress(p));
      toast.success("Model uploaded successfully!");
      navigate("/gallery");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFile(null);
    setFilePreviewUrl(null);
    setName("");
    setDescription("");
    setTags([]);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" id="upload-title">Upload Model</h1>
        <p className="page-subtitle">Add a new 3D model to your collection</p>
      </div>

      <div className="page-body animate-fade-in">
        {!file ? (
          /* Dropzone */
          <div
            {...getRootProps()}
            className={`dropzone-container ${isDragActive ? "active" : ""}`}
            id="dropzone"
          >
            <input {...getInputProps()} />
            <div className="dropzone-icon">
              <Upload />
            </div>
            <h3 className="dropzone-title">
              {isDragActive ? "Drop your model here" : "Drag & drop your GLB file"}
            </h3>
            <p className="dropzone-subtitle">
              or <span>browse files</span> from your computer
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "12px" }}>
              Supports .glb files up to 100MB
            </p>
          </div>
        ) : (
          /* Upload Form with Preview */
          <form onSubmit={handleSubmit}>
            <div className="upload-layout">
              {/* 3D Preview */}
              <div className="upload-preview">
                <div className="upload-preview-canvas">
                  <ModelViewer url={filePreviewUrl} autoRotate={true} />
                </div>
                <div className="upload-preview-info">
                  <div className="file-info">
                    <div className="file-icon">
                      <FileBox size={22} />
                    </div>
                    <div>
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatSize(file.size)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    onClick={clearFile}
                    title="Remove file"
                    id="clear-file-btn"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <div className="form-group">
                  <label className="form-label" htmlFor="model-name">Model Name</label>
                  <input
                    type="text"
                    id="model-name"
                    className="form-input"
                    placeholder="Enter model name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="model-description">Description</label>
                  <textarea
                    id="model-description"
                    className="form-input"
                    placeholder="Describe your 3D model..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="model-tags">Tags</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      id="model-tags"
                      className="form-input"
                      placeholder="Add a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={addTag}
                      id="add-tag-btn"
                    >
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                      {tags.map((tag, i) => (
                        <span
                          key={i}
                          className="tag"
                          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                          onClick={() => removeTag(i)}
                        >
                          {tag}
                          <X size={12} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        Uploading...
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--accent-primary-light)" }}>
                        {progress}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={uploading}
                  style={{ width: "100%" }}
                  id="submit-upload-btn"
                >
                  {uploading ? (
                    <>
                      <div className="loading-spinner" style={{ width: "18px", height: "18px" }}></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Upload Model
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
