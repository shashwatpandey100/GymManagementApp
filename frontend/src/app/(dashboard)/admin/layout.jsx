'use client';
import React from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { authAdmin } from '@/lib/useAuth.js';

export default function RootLayout({ children }) {
  const admin = authAdmin();

  if (admin?.data?.success) {
    return (
      <main className="h-screen w-full flex">
        <section className="max-w-max h-full">
          <Sidebar admin={admin} />
        </section>
        <section section className="w-full h-full">
          <Topbar admin={admin} />
          {children}
        </section>
      </main>
    );
  } else {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }
}
