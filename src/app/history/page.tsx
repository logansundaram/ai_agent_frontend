import ChatLog from "../components/chatlog";

export default function Page(){
    return (
    <div className="font-mono flex flex-col items-center p-[10%] space-y-6">
        <h1 className="text-left w-full font-medium text-xl font-medium">
            History
        </h1>
        <ChatLog title="Starting with AI agents" description="Exploring the fundamentals of building an AI agent, covering initial setup and core components." model="gpt-oss"/>
        <ChatLog title="Intro to RAG agents" description="Discussion on designing a retrieval-augmented generation agent, focusing on integrating search with model reasoning." model="gpt-oss"/>
        <ChatLog title="Comparing different models" description="Experimenting with model variations, including llama3.1, to evaluate differences in output and performance." model="llama3.1"/>
    </div>);
}
