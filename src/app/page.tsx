'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const auth = localStorage.getItem('auth');
    if (auth) {
      const userData = JSON.parse(auth);
      if (userData.data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}
