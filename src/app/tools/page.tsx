import ChatLog from "../components/chatlog";

export default function Page(){
    return (
    <div className="font-mono flex flex-col items-center p-[10%] space-y-6">
        <h1 className="text-left w-full font-medium text-xl font-medium">
            Tools
        </h1>
        <ChatLog title="Search" description="Ask questions and retrieve information instantly. Ideal for quick lookups, references, or verifying details." model="gpt-oss"/>
        <ChatLog title="Calculator" description="Handle math from simple arithmetic to complex equations—fast, precise, and always at hand." model="gpt-oss"/>
        <ChatLog title="File Manager" description="Upload, organize, and retrieve files on the fly. Keep your workspace clean and connected to your agent." model="llama3.1"/>
        <ChatLog title="Email Monitor" description="Stay on top of important messages. Summarize, filter, and track emails without leaving your workflow." model="deepseek r-1"/>
    </div>);
}
