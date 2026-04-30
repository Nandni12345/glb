import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Gallery from "./pages/Gallery";
import UploadPage from "./pages/UploadPage";
import ViewerPage from "./pages/ViewerPage";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "toast-custom",
          duration: 3000,
          style: {
            background: "#1a1a28",
            color: "#f0f0f8",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
        }}
      />

      <div className="bg-mesh"></div>

      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/viewer/:id" element={<ViewerPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
