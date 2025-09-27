import Link from "next/link";

interface NavbarButtonProps {
    title: string;
}


export default function NavbarButton({title} : NavbarButtonProps){
    return(
        <Link href={`/${title}`} className="hover:text-blue-400">{title}</Link>
    );
}