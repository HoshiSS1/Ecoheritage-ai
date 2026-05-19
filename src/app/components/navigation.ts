import { BookOpen, Map as MapIcon } from 'lucide-react';

export const navLinks = [
  { name: 'Môi trường', path: '/#environment' },
  { name: 'Sức Khỏe', path: '/#health' },
  { 
    name: 'Thư Viện Di Sản', 
    path: '/heritage', 
    subItems: [
      { name: 'Y Lý Cổ Truyền', path: '/heritage', icon: BookOpen },
      { name: 'Chỉ Dẫn Địa Lý', path: '/heritage/map', icon: MapIcon },
    ]
  },
  { name: 'Tư vấn', path: '#contact' }
];
