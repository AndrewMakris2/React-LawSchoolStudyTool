import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ApiKeySetup } from "./components/ApiKeySetup";
import { Home } from "./pages/Home";
import { Readings } from "./pages/Readings";
import { Tutor } from "./pages/Tutor";
import { Briefs } from "./pages/Briefs";
import { Drills } from "./pages/Drills";
import { Flashcards } from "./pages/Flashcards";
import { Progress } from "./pages/Progress";
import { Exam } from "./pages/Exam";
import { Outline } from "./pages/Outline";
import { Glossary } from "./pages/Glossary";
import { TexasTech } from "./pages/TexasTech";
import { getApiKey } from "./api/client";

export default function App() {
  const [apiKeySet, setApiKeySet] = useState(() => !!getApiKey());
  const [changingKey, setChangingKey] = useState(false);

  useEffect(() => {
    setApiKeySet(!!getApiKey());
  }, []);

  const showKeyModal = !apiKeySet || changingKey;

  return (
    <BrowserRouter>
      {showKeyModal && (
        <ApiKeySetup
          onSaved={() => { setApiKeySet(true); setChangingKey(false); }}
          onCancel={apiKeySet ? () => setChangingKey(false) : undefined}
        />
      )}
      <Routes>
        {/* Homepage — no sidebar */}
        <Route index element={<Home onSetupKey={() => setChangingKey(true)} />} />

        {/* App pages — with sidebar */}
        <Route element={<Layout onRequestChangeKey={() => setChangingKey(true)} />}>
          <Route path="/readings"   element={<Readings />} />
          <Route path="/tutor"      element={<Tutor />} />
          <Route path="/briefs"     element={<Briefs />} />
          <Route path="/drills"     element={<Drills />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/progress"   element={<Progress />} />
          <Route path="/exam"       element={<Exam />} />
          <Route path="/outline"    element={<Outline />} />
          <Route path="/glossary"   element={<Glossary />} />
          <Route path="/texas-tech" element={<TexasTech />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
