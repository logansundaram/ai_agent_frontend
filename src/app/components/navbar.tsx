import NavbarButton from "./navbar_button";

export default function Navbar(){
    return (
        <div className="flex space-x-20 fixed">
            <NavbarButton title="chat"/>
            <NavbarButton title="models"/>
            <NavbarButton title="tools"/>
            <NavbarButton title="history"/>
        </div>
    );
}