import Message from "../components/message";

export default function Page(){ 
    /*
    document.getElementById('').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission behavior

    const inputValue = document.getElementById('myInput').value;
    document.getElementById('output').textContent = "You entered: " + inputValue;
    */

    return (
        <main className="flex flex-col font-mono min-h-screen">
            <div className="flex flex-col space-y-10 pl-60 pt-10">
                <Message/>
                <Message/>
                <Message/>
                <Message/>
            </div>
            <div className="fixed bottom-4 inset-x-0 flex justify-center px-4 pl-35">
                <div className="w-full max-w-2xl">
                    <div className="mb-2 text-left text-sm font-medium text-slate-600">
                        get some work done
                    </div>
                    <form>
                        <div className="flex items-center gap-2 rounded-full border border-black/20 bg-white/80 backdrop-blur shadow-lg px-4 py-2">
                                <input type="text" placeholder="Input query here" className="flex-1 bg-transparent text-base focus:outline-none placeholder:text-slate-400"/>
                                <button type="button" className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium bg-black text-white hover:bg-blue-400">
                                    Send
                                </button>
                        </div>
                    </form>
                    <div className="mt-2 text-center text-xs text-slate-500">
                        saturday can be wrong. review all info as necessary
                    </div>
                </div>
            </div>
        </main>
    );
}
