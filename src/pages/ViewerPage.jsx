import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash2, Calendar, HardDrive, Tag } from "lucide-react";
import { api } from "../services/api";
import ModelViewer from "../components/ModelViewer";
import DeleteModal from "../components/DeleteModal";
import toast from "react-hot-toast";

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        setLoading(true);
        const data = await api.getModel(id);
        setModel(data);
      } catch (err) {
        toast.error("Failed to load model");
        navigate("/gallery");
      } finally {
        setLoading(false);
      }
    };
    fetchModel();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await api.deleteModel(id);
      toast.success("Model deleted");
      navigate("/gallery");
    } catch (err) {
      toast.error("Failed to delete model");
    }
  };

  const handleDownload = () => {
    const url = api.getModelFileUrl(id);
    const a = document.createElement("a");
    a.href = url;
    a.download = model?.fileName || "model.glb";
    a.click();
  };

  if (loading) {
    return (
      <div className="viewer-page">
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="loading-spinner" style={{ width: "48px", height: "48px" }}></div>
        </div>
      </div>
    );
  }

  if (!model) return null;

  const modelUrl = api.getModelFileUrl(id);

  return (
    <div className="viewer-page">
      <div className="viewer-canvas">
        <ModelViewer url={modelUrl} autoRotate={false} intensity={0.6} />

        {/* Back button overlay */}
        <div style={{ position: "absolute", top: "20px", left: "20px", zIndex: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            id="back-btn"
            style={{
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(10px)",
              border: "1px solid var(--border-default)",
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </div>

      <div className="viewer-sidebar">
        <div className="viewer-sidebar-header">
          <h2 className="viewer-model-name" id="viewer-model-name">{model.name}</h2>
          {model.description && (
            <p className="viewer-model-desc">{model.description}</p>
          )}
          {model.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "16px" }}>
              {model.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="viewer-sidebar-section">
          <div className="section-title">Model Details</div>
          <div className="info-row">
            <span className="info-label">
              <HardDrive size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              File Size
            </span>
            <span className="info-value">{formatFileSize(model.fileSize)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">
              <Tag size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              File Name
            </span>
            <span className="info-value" style={{ fontSize: "12px" }}>{model.fileName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">
              <Calendar size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Created
            </span>
            <span className="info-value" style={{ fontSize: "12px" }}>{formatDate(model.createdAt)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">
              <Calendar size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Updated
            </span>
            <span className="info-value" style={{ fontSize: "12px" }}>{formatDate(model.updatedAt)}</span>
          </div>
        </div>

        <div className="viewer-sidebar-section">
          <div className="section-title">Controls</div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
            <div>🖱️ <strong>Left click + drag</strong> — Rotate</div>
            <div>🖱️ <strong>Right click + drag</strong> — Pan</div>
            <div>🔄 <strong>Scroll</strong> — Zoom in/out</div>
          </div>
        </div>

        <div className="viewer-sidebar-actions">
          <button className="btn btn-primary" onClick={handleDownload} id="download-btn">
            <Download size={18} />
            Download GLB
          </button>
          <button className="btn btn-danger" onClick={() => setShowDelete(true)} id="viewer-delete-btn">
            <Trash2 size={18} />
            Delete Model
          </button>
        </div>
      </div>

      <DeleteModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        modelName={model.name}
      />
    </div>
  );
}
