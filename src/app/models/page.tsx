import Model from "../components/model";

export default function Page(){
     return (
        <div className="font-mono flex flex-col items-center p-[10%] space-y-6">
            <h1 className="text-left w-full font-medium text-xl font-medium">
                Models
            </h1>
            <Model name="gpt-oss" description="An open-source Mixture of Experts (MoE) model from OpenAI. Known for strong reasoning capabilities and reliable tool-calling support." size="40"/>
            <Model name="deepseek-r1" description="A reasoning-focused MoE model built for efficient expert routing and high-quality problem solving." size="40"/>
            <Model name="gemma3" description="Google’s latest open-weight MoE model family, optimized for efficiency and multimodal tasks." size="40"/>
            <Model name="qwen3" description="Alibaba’s third-generation open MoE model, offering scalable performance with multiple size options." size="40"/>
        </div>

     ); 
}
