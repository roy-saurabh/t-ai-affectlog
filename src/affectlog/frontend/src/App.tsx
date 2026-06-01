import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Datasets from "./pages/Datasets";
import Audit from "./pages/Audit";
import Models from "./pages/Models";
import Compliance from "./pages/Compliance";

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <span style={{ fontWeight: 700, color: "#818cf8", marginRight: "1rem" }}>ALT-AI</span>
        <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
        <NavLink to="/datasets" className={({ isActive }) => isActive ? "active" : ""}>Datasets</NavLink>
        <NavLink to="/audit" className={({ isActive }) => isActive ? "active" : ""}>Audit</NavLink>
        <NavLink to="/models" className={({ isActive }) => isActive ? "active" : ""}>Models</NavLink>
        <NavLink to="/compliance" className={({ isActive }) => isActive ? "active" : ""}>Compliance</NavLink>
      </nav>
      <div style={{ padding: "1.5rem 2rem" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/models" element={<Models />} />
          <Route path="/compliance" element={<Compliance />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
