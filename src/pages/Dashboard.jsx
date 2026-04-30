import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Upload, HardDrive, TrendingUp } from "lucide-react";
import { api } from "../services/api";
import ModelCard from "../components/ModelCard";
import DeleteModal from "../components/DeleteModal";
import toast from "react-hot-toast";

function formatTotalSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

export default function Dashboard() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await api.getModels();
      setModels(data);
    } catch (err) {
      toast.error("Failed to load models");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteModel(deleteTarget);
      setModels((prev) => prev.filter((m) => m._id !== deleteTarget));
      toast.success("Model deleted successfully");
    } catch (err) {
      toast.error("Failed to delete model");
    } finally {
      setDeleteTarget(null);
    }
  };

  const totalSize = models.reduce((acc, m) => acc + (m.fileSize || 0), 0);
  const recentModels = models.slice(0, 6);
  const deletingModel = models.find((m) => m._id === deleteTarget);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" id="dashboard-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your 3D model collection</p>
      </div>

      <div className="page-body animate-fade-in">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Box />
            </div>
            <div className="stat-label">Total Models</div>
            <div className="stat-value">{models.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <HardDrive />
            </div>
            <div className="stat-label">Storage Used</div>
            <div className="stat-value">{formatTotalSize(totalSize)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp />
            </div>
            <div className="stat-label">This Month</div>
            <div className="stat-value">
              {models.filter((m) => {
                const d = new Date(m.createdAt);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </div>
        </div>

        {/* Recent Models */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Recent Models</h2>
          {models.length > 0 && (
            <button className="btn btn-secondary" onClick={() => navigate("/gallery")} id="view-all-btn">
              View All
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" style={{ width: "40px", height: "40px" }}></div>
            <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>Loading models...</p>
          </div>
        ) : models.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Box />
            </div>
            <h3 className="empty-state-title">No models yet</h3>
            <p className="empty-state-desc">
              Upload your first 3D model to get started. Supported format: GLB (glTF Binary).
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/upload")} id="upload-first-btn">
              <Upload size={20} />
              Upload First Model
            </button>
          </div>
        ) : (
          <div className="model-grid">
            {recentModels.map((model) => (
              <ModelCard
                key={model._id}
                model={model}
                onDelete={(id) => setDeleteTarget(id)}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        modelName={deletingModel?.name || ""}
      />
    </>
  );
}
