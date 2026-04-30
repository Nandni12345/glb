import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} />;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6c5ce7" wireframe />
    </mesh>
  );
}

export default function ModelViewer({
  url,
  style = {},
  autoRotate = true,
  controls = true,
  intensity = 0.5,
}) {
  if (!url) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-secondary)",
          color: "var(--text-muted)",
          fontSize: "14px",
          ...style,
        }}
      >
        No model loaded
      </div>
    );
  }

  return (
    <Canvas
      style={{ width: "100%", height: "100%", ...style }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={intensity} />
      <directionalLight position={[-5, -5, -5]} intensity={0.2} />

      <Suspense fallback={<LoadingFallback />}>
        <Stage
          environment="city"
          intensity={intensity}
          adjustCamera={1.5}
        >
          <Model url={url} />
        </Stage>
      </Suspense>

      {controls && (
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
        />
      )}
    </Canvas>
  );
}
