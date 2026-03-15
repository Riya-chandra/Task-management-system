// Root redirect — send to dashboard or login
import { redirect } from 'next/navigation';
export default function Home() { redirect('/dashboard'); }
