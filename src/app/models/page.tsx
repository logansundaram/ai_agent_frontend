import Model from "../components/model";

export default function Page(){
     return (
        <div className="font-mono flex flex-col items-center p-[10%] space-y-6">
            <h1 className="text-left w-full font-medium text-xl font-medium">
                Models
            </h1>
            <Model name="gpt-oss" description="a MoE model from OpenAI. Open source model with good reasoning and tool calling" size="40"/>
            <Model name="gpt-oss" description="a MoE model from OpenAI. Open source model with good reasoning and tool calling" size="40"/>
            <Model name="gpt-oss" description="a MoE model from OpenAI. Open source model with good reasoning and tool calling" size="40"/>
            <Model name="gpt-oss" description="a MoE model from OpenAI. Open source model with good reasoning and tool calling" size="40"/>
        </div>

     ); 
}
