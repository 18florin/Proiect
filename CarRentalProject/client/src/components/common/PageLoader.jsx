//client/src/components/common/PageLoader.jsx
import "./PageLoader.css";

export default function PageLoader() {
  return (
    <div className="page-loader-overlay">
      <div className="page-loader-scene">
        <div className="road"></div>
        <div className="car">🚗</div>
      </div>
      <p className="page-loader-text">Se încarcă...</p>
    </div>
  );
}
