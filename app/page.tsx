'use client';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function Page() {
  useEffect(() => {
    window.location.href = 'https://bhaskarpandhe.netlify.app/';
  }, []);

  return null;
}