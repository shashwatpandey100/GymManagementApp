'use client';
import React from 'react';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoMenuOutline } from 'react-icons/io5';
import { IoHomeOutline } from 'react-icons/io5';
import { CiDumbbell } from 'react-icons/ci';
import { VscFeedback } from 'react-icons/vsc';
import { IoChatboxOutline } from 'react-icons/io5';
import { BsCashCoin } from 'react-icons/bs';
import { BsRepeat } from 'react-icons/bs';
import { CiUser } from 'react-icons/ci';

const Sidebar = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [sidebar, setSidebar] = React.useState(false);

  const handleLogout = async () => {
    try {
      const res = await axios.post(`/api/v1/admin/logout`);
      if (res?.data?.success) {
        toast({
          title: 'Admin logged out successfully',
          description: 'Redirecting to login page',
          duration: 1500,
        });
        setTimeout(() => {
          router.push(`/login/admin`);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={`${sidebar ? 'w-[200px]' : 'w-[60px]'} h-full flex flex-col bg-[#f9fafc] border-r border-[rgba(0,0,0,0.1)] transition-width duration-500 overflow-hidden`}
    >
      <div className="w-full h-[60px] flex p-[13px] items-center">
        <div
          className="h-[34px] aspect-square border border-[rgba(0,0,0,0.1)] hover:bg-[#edeef0] rounded-[5px] cursor-pointer flex items-center justify-center text-[20px]"
          onClick={() => setSidebar(!sidebar)}
        >
          <IoMenuOutline />
        </div>
      </div>
      <div className="h-full w-full p-[13px] flex flex-col gap-1">
        <Link href="/admin/">
          <div
            className={`${sidebar ? 'w-full' : 'w-[34px]'} h-[38px] text-[15px] py-[7px] hover:bg-[#edeef0] flex items-center rounded-[5px]`}
          >
            <span className="min-w-[34px] text-[#2966cb] aspect-square rounded-[5px] hover:bg-[#edeef0] flex items-center justify-center text-[20px]">
              <IoHomeOutline />
            </span>
            <span className="pl-3 text-[13px]">Dashboard</span>
          </div>
        </Link>
        <Link href="/admin/gyms">
          <div
            className={`${sidebar ? 'w-full' : 'w-[34px]'} h-[38px] text-[15px] py-[7px] hover:bg-[#edeef0] flex items-center rounded-[5px]`}
          >
            <span className="min-w-[34px] text-[#2966cb] aspect-square rounded-[5px] hover:bg-[#edeef0] flex items-center justify-center text-[22px]">
              <CiDumbbell />
            </span>
            <span className="pl-3 text-[13px]">Gyms</span>
          </div>
        </Link>
        <Link href="/admin/managers">
          <div
            className={`${sidebar ? 'w-full' : 'w-[34px]'} h-[38px] text-[15px] py-[7px] hover:bg-[#edeef0] flex items-center rounded-[5px]`}
          >
            <span className="min-w-[34px] text-[#2966cb] aspect-square rounded-[5px] hover:bg-[#edeef0] flex items-center justify-center text-[22px]">
              <CiUser />
            </span>
            <span className="pl-3 text-[13px]">Managers</span>
          </div>
        </Link>
        <Link href="/admin/balance">
          <div
            className={`${sidebar ? 'w-full' : 'w-[34px]'} h-[38px] text-[15px] py-[7px] hover:bg-[#edeef0] flex items-center rounded-[5px]`}
          >
            <span className="min-w-[34px] text-[#2966cb] aspect-square rounded-[5px] hover:bg-[#edeef0] flex items-center justify-center text-[22px]">
              <BsCashCoin />
            </span>
            <span className="pl-3 text-[13px]">Balance</span>
          </div>
        </Link>
        <Link href="/admin/trial-requests">
          <div
            className={`${sidebar ? 'w-full' : 'w-[34px]'} h-[38px] text-[15px] py-[7px] hover:bg-[#edeef0] flex items-center rounded-[5px]`}
          >
            <span className="min-w-[34px] text-[#2966cb] aspect-square rounded-[5px] hover:bg-[#edeef0] flex items-center justify-center text-[22px]">
              <BsRepeat />
            </span>
            <span className="pl-3 text-[13px]">Manage trials</span>
          </div>
        </Link>
        <Link href="/admin/feedback">
          <div
            className={`${sidebar ? 'w-full' : 'w-[34px]'} h-[38px] text-[15px] py-[7px] hover:bg-[#edeef0] flex items-center rounded-[5px]`}
          >
            <span className="min-w-[34px] text-[#2966cb] aspect-square rounded-[5px] hover:bg-[#edeef0] flex items-center justify-center text-[22px]">
              <VscFeedback />
            </span>
            <span className="pl-3 text-[13px]">Feedback</span>
          </div>
        </Link>
      </div>
      <div className="w-full h-[60px] flex p-[13px] items-center">
        <span
          className="text-red-600 text-[23px] cursor-pointer"
          onClick={handleLogout}
        >
          <RiLogoutBoxRLine />
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
