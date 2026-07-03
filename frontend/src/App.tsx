import { test } from "@/lib/test";

function App() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0B0F19",
        color: "white",
        fontSize: "40px",
        fontWeight: "700",
      }}
    >
      {test}
    </div>
  );
}

export default App;