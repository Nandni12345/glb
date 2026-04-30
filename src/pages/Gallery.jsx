import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Upload, Search } from "lucide-react";
import { api } from "../services/api";
import ModelCard from "../components/ModelCard";
import DeleteModal from "../components/DeleteModal";
import toast from "react-hot-toast";

export default function Gallery() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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

  const filtered = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase()) ||
      m.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const deletingModel = models.find((m) => m._id === deleteTarget);

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title" id="gallery-title">Model Gallery</h1>
            <p className="page-subtitle">{models.length} models in your collection</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/upload")} id="gallery-upload-btn">
            <Upload size={18} />
            Upload
          </button>
        </div>
      </div>

      <div className="page-body animate-fade-in">
        {/* Search Bar */}
        {models.length > 0 && (
          <div style={{ marginBottom: "28px", position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search models by name, description, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-models-input"
              style={{ paddingLeft: "44px" }}
            />
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" style={{ width: "40px", height: "40px" }}></div>
            <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>Loading gallery...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Box />
            </div>
            <h3 className="empty-state-title">
              {search ? "No models found" : "No models yet"}
            </h3>
            <p className="empty-state-desc">
              {search
                ? `No models matching "${search}". Try a different search term.`
                : "Upload your first 3D model to start building your gallery."}
            </p>
            {!search && (
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/upload")} id="gallery-empty-upload-btn">
                <Upload size={20} />
                Upload Model
              </button>
            )}
          </div>
        ) : (
          <div className="model-grid">
            {filtered.map((model) => (
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
