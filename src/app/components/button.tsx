import {LucideIcon} from "lucide-react";

interface ButtonProps {
  name: string;
  primary?: boolean;
  icon?: LucideIcon;
  size?: "small" | "medium" | "large";
}


// secondary button colors : bg-black/20 text-black hover:bg-black/30

// primary button colors : bg-black/80 text-white hover:bg-black

export default function Button_Primary({ name, primary = false, icon : Icon, size = "small"}: ButtonProps) {
  return (
    <button className={`rounded-2xl text-xs p-2 font-medium transition flex justify-center items-center w-min ${
        primary
          ? "bg-black/80 text-white hover:bg-black"
          : "bg-black/20 text-black hover:bg-black/30"}`}>
      {Icon && <Icon className="p-1"/>}
      {Icon ? name : <span className="p-1">{name}</span>}
    </button>
  );
}