import Link from "next/link";
import { usePathname } from 'next/navigation'


export default function ActiveLink({ href, children }: { href: string; children: React.ReactNode }){
    const pathname = usePathname();
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return (
        <Link href={href} aria-current={active ? 'page' : undefined} className={`px-2 py-1 rounded-md hover:bg-black/5 ${active ? 'font-semibold text-slate-900 bg-black/10' : 'text-slate-800/80'}`}>
            {children}
        </Link>
    );
}