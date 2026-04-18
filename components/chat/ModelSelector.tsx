"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Model {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setModels(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load models");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-8 w-36 rounded-lg bg-[#f4f4f5] animate-pulse" />
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-[#e4e4e7] rounded-lg px-3 py-1.5 bg-white text-sm font-medium cursor-pointer hover:border-[#a1a1aa] focus:outline-none transition-colors"
    >
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
}
