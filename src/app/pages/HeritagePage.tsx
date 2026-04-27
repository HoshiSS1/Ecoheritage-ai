import { useState, useLayoutEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Leaf } from 'lucide-react';
import { TraditionalRemedyCard } from '../components/TraditionalRemedyCard';
import { PaginationBar } from '../components/PaginationBar';
import { traditionalRemedies } from '../data';

const ITEMS_PER_PAGE = 9;

export function HeritagePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  // Khắc phục triệt để lỗi nhảy trang do Suspense (Lazy load)
  useLayoutEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Bọc lót thêm một lớp bảo vệ sau khi paint
    const t1 = requestAnimationFrame(() => {
      if (topRef.current) topRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.scrollTo(0, 0);
    });
    const t2 = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    return () => { cancelAnimationFrame(t1); clearTimeout(t2); };
  }, []);

  const categories = ['Tất cả', ...Array.from(new Set(traditionalRemedies.map(r => r.category)))];

  const filteredRemedies = traditionalRemedies.filter(remedy => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = remedy.name.toLowerCase().includes(searchLower) || 
                          remedy.benefits.toLowerCase().includes(searchLower) ||
                          (remedy.keywords && remedy.keywords.some(kw => kw.toLowerCase().includes(searchLower)));
    const matchesFilter = activeFilter === 'Tất cả' || remedy.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Reset page when filter or search changes
  useLayoutEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  const totalPages = Math.ceil(filteredRemedies.length / ITEMS_PER_PAGE);
  const currentRemedies = filteredRemedies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div ref={topRef} className="min-h-screen bg-[#051a11] pt-32 pb-20">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/textures/cubes.png')]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-emerald-600/10 blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-6 backdrop-blur-md"
          >
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 font-bold">Thư viện Di sản</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-6"
          >
            Tinh hoa <em className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 not-italic font-bold">Y học cổ truyền</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-emerald-100/70 font-light"
          >
            Khám phá kho tàng bài thuốc dân gian quý giá được đúc kết qua hàng trăm năm, nay được phân tích dưới góc nhìn khoa học hiện đại.
          </motion.p>
        </div>

        {/* Search & Filter */}
        <div className="mb-12 space-y-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Tìm kiếm bài thuốc, công dụng, dược liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 transition-all"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 mr-2 text-white/60 text-sm font-medium">
              <Filter className="w-4 h-4" /> Bộ lọc:
            </div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {filteredRemedies.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 perspective-[1500px]">
              {currentRemedies.map((remedy, idx) => (
                <TraditionalRemedyCard key={remedy.name} {...remedy} index={idx} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12">
                <PaginationBar 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    if (topRef.current) {
                      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 mb-4">
              <Leaf className="w-8 h-8" />
            </div>
            <h3 className="text-xl text-white font-medium mb-2">Không tìm thấy bài thuốc nào</h3>
            <p className="text-white/50">Vui lòng thử lại với từ khóa khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
