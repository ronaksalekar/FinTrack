import "./PageLoader.css";

export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-card">
        <div className="loader-shimmer loader-line lg" />
        <div className="loader-shimmer loader-line md" />
        <div className="loader-grid">
          <div className="loader-shimmer loader-block" />
          <div className="loader-shimmer loader-block" />
          <div className="loader-shimmer loader-block" />
        </div>
      </div>
    </div>
  );
}
