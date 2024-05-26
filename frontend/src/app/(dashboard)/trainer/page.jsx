'use client';
import React from 'react';
import { authTrainer } from '@/lib/useAuth.js';

const page = () => {
  const trainer = authTrainer();

  if (trainer?.data?.success) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Trainer dashboard {trainer?.data?.data?.manager?.email}
      </div>
    );
  } else {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Please log in to access the trainer dashboard.
      </div>
    );
  }
};

export default page;
