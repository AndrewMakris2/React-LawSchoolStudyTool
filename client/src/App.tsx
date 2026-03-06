import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
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
        {/* Homepage — no sidebar */}
        <Route index element={<Home />} />

        {/* App pages — with sidebar */}
        <Route element={<Layout />}>
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
