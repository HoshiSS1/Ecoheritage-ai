import { useState, useEffect } from 'react';
import { traditionalRemedies as defaultRemedies } from '../data';
import { HERITAGE_LOCATIONS as defaultHeritages } from '../heritageData';

const API_URL = 'http://localhost:5000/api';

export function useHeritages() {
  const [heritages, setHeritages] = useState(defaultHeritages);
  const [loading, setLoading] = useState(true);

  const fetchHeritages = () => {
    setLoading(true);
    fetch(`${API_URL}/heritages`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setHeritages(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch heritages:', err);
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
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setRemedies(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch remedies:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRemedies();
  }, []);

  return { remedies, loading, refetch: fetchRemedies };
}
