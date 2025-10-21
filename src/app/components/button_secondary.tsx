import {Cog} from "lucide-react";

interface Button_SecondaryProps {
  name: string;
}


export default function Button_Secondary({name} : Button_SecondaryProps){
    return (
        <button className="rounded-2xl bg-black/20 text-black text-xs p-2 font-medium hover:bg-black/30 transition flex justify-center items-center w-min">
            <Cog className="p-1"/>{name}
      </button>
    );
}