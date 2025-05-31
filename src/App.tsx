import React from "react";
import { GradualSunflowers } from "./components/gradual-sunflowers";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="w-full h-screen">
        <GradualSunflowers />
      </div>
    </div>
  );
}