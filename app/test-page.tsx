export default function TestPage() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "2rem",
        backgroundColor: "#f5f5f5",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>Test Page</h1>
      <p style={{ color: "#666" }}>If you can see this page, the basic rendering is working.</p>
    </div>
  )
}

