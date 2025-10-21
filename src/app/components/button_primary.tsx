import {Cog} from "lucide-react";

interface ButtonProps {
  name: string;
  primary?: boolean;

}

// secondary button colors : bg-black/20 text-black hover:bg-black/30

// primary button colors : bg-black/80 text-white hover:bg-black

export default function Button_Secondary({ name, primary = false}: ButtonProps) {
  return (
    <button
      className={`rounded-2xl text-xs p-2 font-medium transition flex justify-center items-center w-min ${
        primary
          ? "bg-black/80 text-white hover:bg-black"
          : "bg-black/20 text-black hover:bg-black/30"
      }`}
    >
      <Cog className="p-1" />
      {name}
    </button>
  );
}