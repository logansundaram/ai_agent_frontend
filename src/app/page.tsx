
export default function Home() {
  return (
    <div className="font-mono flex flex-col items-center p-[10%] space-y-10">
      <h1 className="text-left w-full text-xl font-medium">Your AI Assistant, Upgraded.</h1>
      <p>Jarvis.ai is a self-tooling AI agent that plans, verifies, and adapts on the fly. No rigid workflows, no dead ends—just an AI that builds, learns, and improves with you. Provenance, reliability, and flexibility are baked in, so you can move from idea to execution without friction.</p>
      <form>
        <p className="text-center">Coming soon.</p>
        <input type="text" className="border-black border-2 focus:outline-none focus:border-blue-400"/>
      </form>
    </div>
  );
}
