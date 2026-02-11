import { redirect } from 'next/navigation';

// Server-side redirect: root URL -> /ads
export default function Page() {
  redirect('/ads');
  return null;
}
