'use client';
import React from 'react';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';
import { PiEyeSlashThin } from 'react-icons/pi';
import { PiEyeThin } from 'react-icons/pi';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const page = ({ params }) => {
  const router = useRouter();

  const { toast } = useToast();

  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/v1/${params.user}/login`, formData);
      if (res.data.success) {
        toast({
          title: 'Login successful',
          description: 'Redirecting to dashboard',
          duration: 1500,
        });
        setTimeout(() => {
          router.push(`/${params.user}`);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="flex h-screen p-4">
      <section className="w-[50%] h-full flex items-center justify-center rounded-[25px] bg-black overflow-hidden relative">
        <div className="rounded-full h-[380px] aspect-square border-8 border-[rgba(255,255,255,0.05)] absolute top-[-200px] left-[-90px]"></div>
        <div className="rounded-full h-[400px] aspect-square border-8 border-[rgba(255,255,255,0.05)] absolute bottom-[-180px] right-[-40px]"></div>
      </section>
      <section className="w-[50%] h-full px-24 pb-12 pt-24">
        <div className="h-full w-full flex flex-col gap-[5px] items-center relative">
          <Image src="/logo.png" width={200} height={200} alt="Logo" />
          <p className="text-[16px] font-[500] mt-[35px]">
            {params.user.charAt(0).toUpperCase() + params.user.slice(1)} login
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-[10px] my-[15px] w-full"
          >
            <div className="w-[400px] max-h-max flex justify-center items-center relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="h-[48px] w-full max-w-[400px] focus:outline-none p-[16px] text-[15px] border-2 border-[rgba(0,0,0,0.1)] rounded-[15px]"
              />
            </div>
            <div className="w-[400px] max-h-max flex justify-center items-center relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="h-[48px] w-full max-w-[400px] focus:outline-none p-[16px] text-[15px] border-2 border-[rgba(0,0,0,0.1)] rounded-[15px]"
              />
              <button
                onClick={togglePasswordVisibility}
                className="absolute right-[10px]"
              >
                {!showPassword ? <PiEyeSlashThin /> : <PiEyeThin />}
              </button>
            </div>
            <p className="text-[13px] font-[500] cursor-pointer my-[10px]">
              Forgot password?
            </p>
            <button
              type="submit"
              className="h-[48px] w-full max-w-[400px] p-[16px] text-[15px] bg-black rounded-[15px] text-white text-[15px] flex items-center justify-center"
            >
              Login
            </button>
          </form>
          <div className="w-full flex items-center justify-center mt-[15px]">
            <div className="w-[100px] h-[1px] border border-[rgba(0,0,0,0.1)]"></div>
            <div className="px-[15px] text-center text-[12px] text-[rgba(0,0,0,0.7)]">
              Or login with
            </div>
            <div className="w-[100px] h-[1px] border border-[rgba(0,0,0,0.1)]"></div>
          </div>
          <div className="w-full flex items-center justify-center gap-[15px] my-[20px]">
            <button className="h-[48px] w-full max-w-[150px] p-[16px] text-[15px] border-2 border-[rgba(0,0,0,0.1)] rounded-[15px] flex gap-[7px] items-center justify-center">
              <img src="/google.png" alt="google" className="max-h-[22px]" />
              <span className="text-[14px] font-[500]">Google</span>
            </button>
            <button className="h-[48px] w-full max-w-[150px] p-[16px] text-[15px] border-2 border-[rgba(0,0,0,0.1)] rounded-[15px] flex gap-[7px] items-center justify-center">
              <img src="/facebook.png" alt="google" className="max-h-[30px]" />
              <span className="text-[14px] font-[500]">Facebook</span>
            </button>
          </div>
          <p className="absolute bottom-0 text-[12px] text-[rgba(0,0,0,0.7)] font-[300]">
            Don't have an account? &nbsp;{' '}
            <Link href="/register">
              <span className="text-[14px] font-[500] text-black cursor-pointer">
                Sign up
              </span>
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default page;
