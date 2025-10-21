import NavbarButton from "./navbar_button";
import Link from "next/link";
//import { useState } from 'react';

export default function Sidebar(){
    //const [open, setOpen] = useState();

    return (
        <div className="flex flex-col space-y-10 fixed left-0 min-h-screen p-4 w-35 rounded-r-lg border border-black/20 bg-white/80 backdrop-blur shadow-lg">
            <Link href="/" className="hover:text-blue-400 pb-40 pt-4">saturday</Link>
            <NavbarButton title="chat"/>
            <NavbarButton title="models"/>
            <NavbarButton title="tools"/>
            <NavbarButton title="history"/>
            <NavbarButton title="workflow"/>
            <NavbarButton title="testing"/>
        </div>
    );
}