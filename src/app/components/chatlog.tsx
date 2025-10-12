interface ChatLogProps {
    title: string;
    description: string;
    model: string;
}

export default function ChatLog({title, description, model} : ChatLogProps){
    return(
        <div className="flex flex-col bg-transparent backdrop-blur-sm w-full rounded-xl p-4 shadow-md hover:shadow-lg hover:scale-[1.01] transition cursor-pointer border-1 border-black bg-white/30">
            <div className="p-5">
                <div className="text-lg font-bold">
                    {title}
                </div>
                {description}
                <div className="text-sm">
                Model: {model}
                </div>
            </div>
        </div>
    );
}