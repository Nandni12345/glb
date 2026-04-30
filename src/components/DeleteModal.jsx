export default function DeleteModal({ isOpen, onClose, onConfirm, modelName }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="delete-modal">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Delete Model</h3>
        <p className="modal-desc">
          Are you sure you want to delete <strong>{modelName}</strong>? This action
          cannot be undone and the 3D file will be permanently removed.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} id="cancel-delete-btn">
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} id="confirm-delete-btn">
            Delete Model
          </button>
        </div>
      </div>
    </div>
  );
}
