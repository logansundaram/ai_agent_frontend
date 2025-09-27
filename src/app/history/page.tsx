import ChatLog from "../components/chatlog";

export default function Page(){
    return (
    <div className="font-mono flex flex-col items-center p-[10%] space-y-6">
        <h1 className="text-left w-full font-medium text-xl font-medium">
            History
        </h1>
        <ChatLog title="my first chat" description="how can I create an ai agent?" model="gpt-oss"/>
        <ChatLog title="my second chat" description="how can I create a rag agent?" model="gpt-oss"/>
        <ChatLog title="my third chat" description="how can I create an ai agent?" model="llama3.1"/>
    </div>);
}
