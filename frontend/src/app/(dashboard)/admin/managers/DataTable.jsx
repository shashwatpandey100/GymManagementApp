import React from 'react';
import { FaSort } from 'react-icons/fa';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import axios from 'axios';

const DataTable = ({ managers }) => {
  const columns = [
    {
      name: 'Name',
      sort: false,
    },
    {
      name: 'Joined On',
      sort: true,
    },
    {
      name: 'Subscription Validity',
      sort: false,
    },
    {
      name: 'Phone Number',
      sort: false,
    },
    {
      name: 'Email',
      sort: false,
    },
  ];

  const [sortOrder, setSortOrder] = React.useState('asc');
  const [sortBy, setSortBy] = React.useState('Subscription Fees');
  const [sortedManagers, setSortedManagers] = React.useState(managers);

  const handleDelete = async (managerId) => {
    try {
      const res = await axios.delete(
        `/api/v1/admin/managers/delete?managerId=${managerId}`
      );
      if (res.data.success) {
        const index = managers.findIndex(
          (manager) => manager._id === managerId
        );

        if (index !== -1) {
          managers.splice(index, 1);
        }
        const updatedManagers = managers.filter(
          (manager) => manager._id !== managerId
        );
        setSortedManagers(updatedManagers);
      }
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    const sortedArray = [...managers];

    if (sortBy === 'Joined On') {
      sortedArray.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    setSortedManagers(sortedArray);
  }, [sortBy, sortOrder, managers]);

  return (
    <>
      <div className="flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        scope="col"
                        key={index}
                        className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                      >
                        <p className="flex gap-[5px] items-center">
                          {column.name}
                          {column.sort && (
                            <span
                              className={`cursor-pointer`}
                              onClick={() => {
                                if (column.name === 'Joined On') {
                                  setSortBy('Joined On');
                                }
                                setSortOrder(
                                  sortOrder === 'asc' ? 'desc' : 'asc'
                                );
                              }}
                            >
                              <FaSort />
                            </span>
                          )}
                        </p>
                      </th>
                    ))}
                    <th scope="col" className="relative py-3.5 px-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                  {sortedManagers.map((data, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                        <div className="inline-flex items-center gap-x-3">
                          <span>{data?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        {data?.createdAt
                          ? new Date(data.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              }
                            )
                          : ''}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-1 rounded-full gap-x-2 text-emerald-500 bg-emerald-100/60 dark:bg-gray-800">
                          <h2 className="text-sm font-normal">
                              true
                          </h2>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                        <span className="text-sm font-normal">
                          {data?.phoneCountryCode} {data?.phone}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-nowrap">
                        <div className="flex items-center gap-x-2">
                          <img
                            className="object-cover w-8 h-8 rounded-full"
                            src={data?.avatar}
                            alt=""
                          />
                          <div>
                            <p className="text-xs font-normal text-gray-600 dark:text-gray-400">
                              {data?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-x-6">
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <span className="text-red-400 transition-colors duration-200 hover:text-red-500 focus:outline-none">
                                Delete
                              </span>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete manager's data and all
                                  associated gyms.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    handleDelete(data?._id);
                                  }}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataTable;
