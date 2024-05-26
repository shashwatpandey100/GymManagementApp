'use client';
import React from 'react';
import axios from 'axios';
import DataTable from './DataTable';
import { Input } from '@/components/ui/input';
import { IoSearchOutline } from 'react-icons/io5';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const page = () => {
  const searchParams = useSearchParams();

  const [gyms, setGyms] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const handleChange = (e) => {
    const { value } = e.target;
    setSearch(value);
  };

  const [totalPages, setTotalPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = searchParams.get('pageSize') || 10;

  React.useEffect(() => {
    const pageParam = parseInt(searchParams.get('page')) || 1;
    setCurrentPage(pageParam);
  }, [searchParams]);

  React.useEffect(() => {
    const fetchGyms = async () => {
      try {
        const res = await axios.get(
          `/api/v1/admin/gyms?page=${currentPage}&pageSize=${pageSize}`
        );
        if (res?.data?.success) {
          setGyms(res.data.data.gyms);
          setTotalPages(res.data.data.totalPages);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchGyms();
  }, [currentPage, pageSize]);

  const pagesArray = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(
        `/api/v1/admin/gyms/search?search=${search}&page=${page}&pageSize=${pageSize}`
      );
      if (res.data.success) {
        setGyms(res.data.data.gyms);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="h-[calc(100%-60px)] w-full flex flex-col text-[12px] py-4">
      <section className="container px-4 mx-auto">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="relative h-9 max-w-max">
            <Input
              type="text"
              placeholder="Search"
              onChange={handleChange}
              name="search"
              className="w-[400px]"
            />
            <button
              type="submit"
              className="absolute right-[1px] top-[1px] h-[calc(100%-2px)] aspect-square rounded-md bg-[#f9fafc] hover:bg-[#edeef0] flex items-center justify-center text-[16px] text-[#2966cb]"
            >
              <IoSearchOutline />
            </button>
          </div>
        </form>
        <DataTable gyms={gyms} />
        <div className="flex items-center justify-center gap-[15px] mt-6">
          <div className="items-center hidden md:flex gap-x-3">
            {pagesArray.map((page) => (
              <Link
                key={page}
                href={`/admin/gyms?page=${page}&pageSize=${pageSize}`}
                className="px-2 py-1 text-sm text-blue-500 rounded-md bg-gray-100 hover:bg-blue-100/60"
              >
                {page}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
};

export default page;
