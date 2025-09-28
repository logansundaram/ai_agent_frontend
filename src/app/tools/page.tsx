import ChatLog from "../components/chatlog";

export default function Page(){
    return (
    <div className="font-mono flex flex-col items-center p-[10%] space-y-6">
        <h1 className="text-left w-full font-medium text-xl font-medium">
            Tools
        </h1>
        <ChatLog title="Tool 1" description="Search" model="gpt-oss"/>
        <ChatLog title="Tool 2" description="Calculator" model="gpt-oss"/>
        <ChatLog title="Tool 3" description="File Management" model="llama3.1"/>
    </div>);
}
