import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import { RouterProvider } from "react-router-dom";

import { router } from "./app/router/router";

import "leaflet/dist/leaflet.css";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
  <AuthProvider>
    <Toaster
      richColors
      position="top-right"
      closeButton
    />

    <RouterProvider router={router} />
  </AuthProvider>
</React.StrictMode>
);