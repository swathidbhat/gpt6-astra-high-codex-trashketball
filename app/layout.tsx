import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Trashketball — From office to ocean',icons:{icon:'/favicon.svg'},description:'Take a break. Toss crumpled paper in two beautiful 3D rooms with real physics and visible trajectories. Score 100 to escape the office.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>;}
