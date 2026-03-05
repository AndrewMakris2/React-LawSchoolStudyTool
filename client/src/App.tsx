import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Readings } from "./pages/Readings";
import { Tutor } from "./pages/Tutor";
import { Briefs } from "./pages/Briefs";
import { Drills } from "./pages/Drills";
import { Flashcards } from "./pages/Flashcards";
import { Progress } from "./pages/Progress";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/readings" replace />} />
          <Route path="/readings"   element={<Readings />} />
          <Route path="/tutor"      element={<Tutor />} />
          <Route path="/briefs"     element={<Briefs />} />
          <Route path="/drills"     element={<Drills />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/progress"   element={<Progress />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}