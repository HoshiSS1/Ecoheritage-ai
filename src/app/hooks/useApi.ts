import { useState, useEffect } from 'react';
import { traditionalRemedies as defaultRemedies } from '../data';
import { HERITAGE_LOCATIONS as defaultHeritages } from '../heritageData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


export function useHeritages() {
  const [heritages, setHeritages] = useState(defaultHeritages);
  const [loading, setLoading] = useState(true);

  const fetchHeritages = () => {
    setLoading(true);
    fetch(`${API_URL}/heritages`)
      .then(res => {
        // [FIX] Kiểm tra response OK trước khi parse JSON — tránh crash khi server trả HTML error
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setHeritages(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('API heritages không khả dụng, dùng dữ liệu mặc định:', err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHeritages();
  }, []);

  return { heritages, loading, refetch: fetchHeritages };
}

export function useRemedies() {
  const [remedies, setRemedies] = useState(defaultRemedies);
  const [loading, setLoading] = useState(true);

  const fetchRemedies = () => {
    setLoading(true);
    fetch(`${API_URL}/remedies`)
      .then(res => {
        // [FIX] Kiểm tra response OK trước khi parse JSON
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRemedies(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('API remedies không khả dụng, dùng dữ liệu mặc định:', err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRemedies();
  }, []);

  return { remedies, loading, refetch: fetchRemedies };
}
