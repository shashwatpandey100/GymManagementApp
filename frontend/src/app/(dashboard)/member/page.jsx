'use client';
import React from 'react';
import { authMember } from '@/lib/useAuth.js';

const page = () => {
  const member = authMember();

  if (member?.data?.success) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Member dashboard {member?.data?.data?.manager?.email}
      </div>
    );
  } else {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Please log in to access the member dashboard.
      </div>
    );
  }
};

export default page;
