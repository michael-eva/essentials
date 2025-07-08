import React, { useState } from "react";
import { Input } from "@/components/ui/input";

type CustomOtherInputProps = {
  placeholder: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (idx: number) => void;
};

export function CustomOtherInput({
  placeholder,
  items,
  onAdd,
  onRemove,
}: CustomOtherInputProps) {
  const [input, setInput] = useState("");

  return (
    <div>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <button
          type="button"
          className="rounded bg-[#635BFF] px-4 py-1 text-white text-sm"
          onClick={() => {
            if (input.trim() !== "") {
              onAdd(input.trim());
              setInput("");
            }
          }}
        >
          Add
        </button>
      </div>
      <div className="mt-2 space-y-2 text-sm">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded bg-gray-50 px-4 py-2"
          >
            <span className="text-gray-700">{item}</span>
            <button
              type="button"
              className="text-red-500"
              onClick={() => onRemove(idx)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
