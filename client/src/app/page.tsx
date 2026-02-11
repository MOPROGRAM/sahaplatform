"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect the homepage to the Ads page
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.push('/ads');
  }, [router]);
  return null;
}
