"use client";

import { ArrowRight, Play, Download, Trash2, Clock, Filter, Star, Book, Cog } from "lucide-react";
import Button_Primary from "../components/button";
import ActiveLink from "../components/activelink";

export default function Page(){




  return (
  <div className="justify-center flex flex-col w-full h-min-screen p-10 space-y-10 space-x-10">

    <ActiveLink href="/testing/testing_routing">Go to nested test page</ActiveLink>


      <button className="rounded-2xl bg-black/20 text-black text-xs p-2 font-medium hover:bg-black/30 transition flex justify-center items-center w-min">
            <Cog className="p-1"/>Benchmark
      </button>

      
            <Button_Primary name="Bunch" icon={Book}/>
            <Button_Primary name="Bunch" primary={true}/>

        


        <div className={[
        "relative h-[380px] w-[320px] select-none",
        "rounded-3xl overflow-hidden bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-5 w-3/4",
      ].join(" ")}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(1.05)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/40 to-transparent" />

      <div className="absolute left-4 right-4 top-4 flex items-center gap-2">
        {true && (
          <span className="rounded-full bg-black/10 backdrop-blur px-3 py-1 text-xs font-semibold text-black/80">
            thinking
          </span>
        )}
        <div className="pl-40">
          <Star/>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 text-black">
        <h3 className="text-xl font-semibold drop-shadow-sm">gpt-oss</h3>
        {true && (
          <p className="text-black/70 text-sm leading-snug mt-1">model from openai</p>
        )}
        {true && (
          <div className="mt-2 text-xs text-black/60 flex items-center gap-2">
            <span className="i-lucide-cpu" /> local
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button className="rounded-2xl bg-black/80 text-white text-xs py-2 font-medium hover:bg-black transition">
            Configure
          </button>
          <button className="rounded-2xl bg-black/20 text-black text-xs py-2 font-medium hover:bg-black/30 transition flex justify-center items-center">
            <Cog className="p-1"/>Benchmark
          </button>
          <button className="rounded-2xl bg-black/20 text-black text-xs py-2 font-medium hover:bg-black/30 transition flex justify-center items-center">
            <Book className="p-1"/>Details
          </button>
        </div>
      </div>
    </div>



  <div className="rounded-3xl bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-5 w-3/4">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <div className="text-lg font-semibold">Test title</div>
          <p className="text-sm text-black/70 leading-relaxed">Test summary</p>
          <div className="text-xs text-black/60">Model: gpt-oss</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-black/60">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> 12/14/2025
            </span>
            <span>·</span>
          </div>
        </div>
        <div className="grid gap-2 justify-items-end">
          <button
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-black text-white hover:opacity-90"
          >
            Open <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          /*onClick={onResume}*/
          className="inline-flex items-center gap-2 rounded-2xl bg-black/10 text-sm px-3 py-2 hover:bg-black/15 transition"
        >
          <Play className="h-4 w-4" /> Resume
        </button>
        <button
          /*onClick={onExport}*/
          className="inline-flex items-center gap-2 rounded-2xl bg-black/10 text-sm px-3 py-2 hover:bg-black/15 transition"
        >
          <Download className="h-4 w-4" /> Export
        </button>
        <button
          /*onClick={onDelete}*/
          className="inline-flex items-center gap-2 rounded-2xl bg-black/10 text-sm px-3 py-2 hover:bg-black/15 transition text-rose-700"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    </div>
    
    
    
    
    </div>);
}