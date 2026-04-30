import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import ModelViewer from "./ModelViewer";
import { api } from "../services/api";

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function ModelCard({ model, onDelete }) {
  const navigate = useNavigate();
  const modelUrl = api.getModelFileUrl(model._id);

  const handleClick = () => {
    navigate(`/viewer/${model._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(model._id);
  };

  return (
    <div className="model-card animate-slide-up" onClick={handleClick} id={`model-card-${model._id}`}>
      <div className="model-card-preview">
        <ModelViewer url={modelUrl} autoRotate={true} controls={false} intensity={0.3} />
      </div>

      <div className="model-card-actions">
        <button
          className="action-btn-sm"
          onClick={handleDelete}
          title="Delete model"
          id={`delete-btn-${model._id}`}
        >
          <Trash2 />
        </button>
      </div>

      <div className="model-card-info">
        <div className="model-card-name">{model.name}</div>
        {model.description && (
          <div className="model-card-desc">{model.description}</div>
        )}
        <div className="model-card-meta">
          <span className="model-card-size">
            {formatFileSize(model.fileSize)}
          </span>
          <div className="model-card-tags">
            {model.tags?.slice(0, 3).map((tag, i) => (
              <span key={i} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
