const API_BASE = "/api";

export const api = {
  // Get all models
  async getModels() {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) throw new Error("Failed to fetch models");
    return res.json();
  },

  // Get single model by ID
  async getModel(id) {
    const res = await fetch(`${API_BASE}/models/${id}`);
    if (!res.ok) throw new Error("Failed to fetch model");
    return res.json();
  },

  // Get model file URL (for Three.js loader)
  getModelFileUrl(id) {
    return `${API_BASE}/models/${id}/file`;
  },

  // Upload a new model
  async uploadModel(file, metadata, onProgress) {
    const formData = new FormData();
    formData.append("model", file);
    formData.append("name", metadata.name || file.name.replace(".glb", ""));
    formData.append("description", metadata.description || "");
    formData.append("tags", JSON.stringify(metadata.tags || []));

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/models`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(JSON.parse(xhr.responseText).error || "Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    });
  },

  // Delete a model
  async deleteModel(id) {
    const res = await fetch(`${API_BASE}/models/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete model");
    return res.json();
  },

  // Update model metadata
  async updateModel(id, data) {
    const res = await fetch(`${API_BASE}/models/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update model");
    return res.json();
  },
};
