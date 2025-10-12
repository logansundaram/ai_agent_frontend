interface MessageProp{
    query : string;
}

export default function Message({query} : MessageProp){
    return (
        <div className="flex flex-col items-end">
            <div className="text-black border-1 border-black bg-white/30 backdrop-blur shadow-lg p-4 rounded-xl mr-10">
                <div>
                    {query}
                </div>
            </div>
        </div>
    );
}