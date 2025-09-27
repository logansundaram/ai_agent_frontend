interface ModelProp{
    name: string;
    description: string;
    size: string;
}

export default function Model({name, description, size} : ModelProp){
    return (
        <div className="flex flex-col bg-transparent backdrop-blur-sm w-full rounded-xl p-4 shadow-md hover:shadow-lg hover:scale-[1.01] transition cursor-pointer border-1 border-black">
            <div>
                {name}
            </div>
            <div>
                {description}
            </div>
            <div>
                {size}
            </div>
        </div>
    );
}