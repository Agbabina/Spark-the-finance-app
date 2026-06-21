import { FaBolt } from "react-icons/fa";
import { FaReact } from "react-icons/fa";
import { SiTailwindcss } from "react-icons/si";

export default function Thumbnail() {
  return (
    <div className="h-screen bg-slate-900 flex flex-col justify-center items-center text-white relative overflow-hidden">

      {/* Lightning */}
      <FaBolt className="absolute top-16 right-32 text-yellow-400 text-[180px] rotate-12 opacity-80" />

      {/* Logos */}
      <div className="flex gap-6 mb-8">
        <FaReact className="text-cyan-400 text-6xl" />
        <SiTailwindcss className="text-sky-400 text-6xl" />
      </div>

      {/* Main title */}
      <h1 className="text-8xl font-extrabold text-purple-500">
        SPARK
      </h1>

      {/* Hook */}
      <h2 className="text-4xl font-bold mt-4">
        Finance Tracker
      </h2>

      <p className="text-2xl text-gray-300 mt-3">
        Beautiful • Fast • Minimal
      </p>

      {/* Glow */}
      <div className="absolute inset-0 bg-purple-500/10 blur-3xl" />
    </div>
  );
}