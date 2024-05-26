'use client';
import React from 'react';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';
import { PiEyeSlashThin } from 'react-icons/pi';
import { PiEyeThin } from 'react-icons/pi';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const page = () => {
  const router = useRouter();

  const { toast } = useToast();

  const [showPassword, setShowPassword] = React.useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
    phoneCountryCode: '',
    phone: '',
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const [avatar, setAvatar] = React.useState(null);
  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('phoneCountryCode', form.phoneCountryCode);
    formData.append('phone', form.phone);
    formData.append('avatar', avatar);

    try {
      const res = await axios.post(`/api/v1/manager/register`, formData);
      console.log(res.data.success);
      if (res.data.success) {
        toast({
          title: 'Registration successful',
          description: 'Please login to continue',
          duration: 1500,
        });
        setTimeout(() => {
          router.push('/login/manager');
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
          <p className="text-[16px] font-[500] mt-[35px]">Register</p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-[10px] my-[15px] w-full"
          >
            <div className="mt-[24px] h-[48px] w-[400px] flex justify-center items-center relative border-2 border-[rgba(0,0,0,0.1)] rounded-[15px]">
              <span className="absolute left-[16px] top-[-28px] text-[15px] text-[rgba(0,0,0,0.5)]">
                Upload avatar
              </span>
              <input
                type="file"
                name="avatar"
                onChange={handleAvatarChange}
                className="w-full focus:outline-none p-[16px] text-[13px]"
              />
            </div>
            <div className="w-[400px] max-h-max flex justify-center items-center relative">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className="h-[48px] w-full max-w-[400px] focus:outline-none p-[16px] text-[15px] border-2 border-[rgba(0,0,0,0.1)] rounded-[15px]"
              />
            </div>
            <div className="w-[400px] max-h-max flex justify-center items-center relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className="h-[48px] w-full max-w-[400px] focus:outline-none p-[16px] text-[15px] border-2 border-[rgba(0,0,0,0.1)] rounded-[15px]"
              />
            </div>
            <div className="w-[400px] max-h-max flex justify-center items-center relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="h-[48px] w-full max-w-[400px] focus:outline-none p-[16px] text-[15px] border-2 border-[rgba(0,0,0,0.1)] rounded-[15px]"
              />
              <button
                onClick={togglePasswordVisibility}
                className="absolute right-[10px] text-[20px]"
              >
                {!showPassword ? <PiEyeSlashThin /> : <PiEyeThin />}
              </button>
            </div>
            <div className="w-[400px] max-h-max flex justify-center items-center gap-[10px] relative">
              <input
                type="text"
                name="phoneCountryCode"
                value={form.phoneCountryCode}
                onChange={handleChange}
                placeholder="+91"
                className="h-[48px] w-full max-w-[70px] focus:outline-none p-[16px] text-[15px] border-2 border-[rgba(0,0,0,0.1)] rounded-[15px]"
              />
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="h-[48px] w-full max-w-[320px] focus:outline-none p-[16px] text-[15px] border-2 border-[rgba(0,0,0,0.1)] rounded-[15px]"
              />
            </div>
            <button
              type="submit"
              className="h-[48px] w-full max-w-[400px] p-[16px] text-[15px] bg-black rounded-[15px] text-white text-[15px] flex items-center justify-center"
            >
              Register
            </button>
          </form>

          <p className="absolute bottom-0 text-[12px] text-[rgba(0,0,0,0.7)] font-[300]">
            Already have an account? &nbsp;{' '}
            <Link href="/login/manager">
              <span className="text-[14px] font-[500] text-black cursor-pointer">
                Login
              </span>
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default page;
