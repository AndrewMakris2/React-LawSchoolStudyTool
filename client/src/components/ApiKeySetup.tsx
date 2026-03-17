import React, { useState } from "react";
import { KeyRound, ExternalLink, Eye, EyeOff, CheckCircle } from "lucide-react";
import { setApiKey } from "../api/client";

interface ApiKeySetupProps {
  onSaved: () => void;
}

export function ApiKeySetup({ onSaved }: ApiKeySetupProps) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSave() {
    const trimmed = value.trim();
    if (!trimmed.startsWith("gsk_")) {
      setError("Groq API keys start with gsk_. Check your key and try again.");
      return;
    }
    if (trimmed.length < 20) {
      setError("That key looks too short. Paste the full key from console.groq.com.");
      return;
    }
    setSaving(true);
    setApiKey(trimmed);
    setTimeout(() => {
      setSaving(false);
      onSaved();
    }, 400);
  }

  return (
    <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-law-700/30 border border-law-700/50 rounded-2xl">
            <KeyRound className="text-law-400" size={28} />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-100 text-center mb-2">
          Enter Your Groq API Key
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">
          LawStudy uses Groq's free API to power all AI features. Your key is stored
          locally in your browser and never sent anywhere except Groq.
        </p>

        {/* Input */}
        <div className="relative mb-3">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="gsk_..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-gray-100 placeholder-gray-600 text-sm focus:outline-none focus:border-law-500 transition-colors font-mono"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-xs mb-3 px-1">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={!value.trim() || saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-law-600 hover:bg-law-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm mb-4"
        >
          {saving ? (
            <>
              <CheckCircle size={16} className="animate-pulse" />
              Saving...
            </>
          ) : (
            "Save API Key & Continue"
          )}
        </button>

        {/* Get key link */}
        <div className="text-center">
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-law-400 hover:text-law-300 transition-colors"
          >
            <ExternalLink size={12} />
            Get a free Groq API key at console.groq.com
          </a>
        </div>

        <p className="text-xs text-gray-600 text-center mt-4 leading-relaxed">
          Your key is stored only in your browser's localStorage.
          Clear your browser data at any time to remove it.
        </p>
      </div>
    </div>
  );
}
