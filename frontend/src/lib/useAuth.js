"use client";
import { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';

const useAuth = (apiEndpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(apiEndpoint);
        setData(res.data);
      } catch (error) {
        console.log(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiEndpoint]);

  return { data, loading, error };
};

const authAdmin = () => {
  return useAuth('/api/v1/admin/me');
};

const authManager = () => {
  return useAuth('/api/v1/manager/me');
};

const authTrainer = () => {
  return useAuth('/api/v1/trainer/me');
};

const authMember = () => {
  return useAuth('/api/v1/member/me');
};

export { authAdmin, authManager, authTrainer, authMember };