'use client';
import React from 'react';
import { authManager } from '@/lib/useAuth.js';

const page = () => {
  const manager = authManager();

  if (manager?.data?.success) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Manager dashboard {manager?.data?.data?.manager?.email}
      </div>
    );
  } else {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Please log in to access the manager dashboard.
      </div>
    );
  }
};

export default page;
