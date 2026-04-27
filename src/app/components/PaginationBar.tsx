import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({ currentPage, totalPages, onPageChange }: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-2 mt-16"
    >
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-emerald-100/70 hover:text-amber-300 hover:bg-white/10 hover:border-amber-400/30 disabled:opacity-30 disabled:hover:text-emerald-100/70 disabled:hover:bg-white/5 disabled:hover:border-white/10 transition-all duration-300 backdrop-blur-md"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-3xl backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.2)]">
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              currentPage === page
                ? 'bg-[#051a11] text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                : 'text-emerald-100/70 border border-transparent hover:text-amber-300 hover:bg-white/10'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-emerald-100/70 hover:text-amber-300 hover:bg-white/10 hover:border-amber-400/30 disabled:opacity-30 disabled:hover:text-emerald-100/70 disabled:hover:bg-white/5 disabled:hover:border-white/10 transition-all duration-300 backdrop-blur-md"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
