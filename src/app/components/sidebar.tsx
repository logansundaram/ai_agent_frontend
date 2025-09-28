import NavbarButton from "./navbar_button";
import Link from "next/link";
//import { useState } from 'react';

export default function Sidebar(){
    //const [open, setOpen] = useState();

    return (
        <div className="flex flex-col space-y-5 fixed left-0 border-1 min-h-screen p-4 w-35 rounded-lg">
            <Link href="/" className="hover:text-blue-400 pb-20">saturday</Link>
            <NavbarButton title="chat"/>
            <NavbarButton title="models"/>
            <NavbarButton title="tools"/>
            <NavbarButton title="history"/>
        </div>
    );
}