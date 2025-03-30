'use client';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function Page() {
  useEffect(() => {
    window.location.href = 'https://logistics-dashboard-frrp.vercel.app/signup';
  }, []);

  return null;
}