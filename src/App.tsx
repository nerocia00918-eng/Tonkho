import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Monitor, 
  Flame, 
  Search, 
  RefreshCcw, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Package,
  Store,
  ChevronDown,
  ChevronUp,
  Calendar,
  Save,
  MessageSquare
} from 'lucide-react';
import { InventoryData, Product, Stats, DisplayItem, Category } from './types';
import { cn, formatCurrency, categorizeProduct } from './lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

// --- Components ---

const TabButton = ({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) => (
  <button
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
      active 
        ? "bg-slate-800 text-emerald-400 shadow-sm" 
        : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
    )}
  >
    <Icon size={18} />
    {label}
  </button>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'hot' | 'promo' | 'warning' }) => {
  const styles = {
    default: "bg-slate-800 text-slate-300 border border-slate-700",
    hot: "bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30",
    promo: "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30",
    warning: "bg-rose-900/40 text-rose-400 border border-rose-800/50",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider", styles[variant])}>
      {children}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'restock' | 'display' | 'hot'>('overview');
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (type: string, payload: any) => {
    setSyncing(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Sync failed');
      }
      
      await fetchData();
    } catch (err) {
      console.error('Sync Error:', err);
      alert(`Lỗi đồng bộ: ${err instanceof Error ? err.message : 'Hãy kiểm tra lại quyền truy cập của Google Script'}`);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <RefreshCcw className="text-blue-600" size={32} />
        </motion.div>
      </div>
    );
  }

  if (!data) return <div>Error loading data</div>;

  const categories: (Category | 'All')[] = ['All', 'CPU', 'Mainboard', 'RAM', 'SSD', 'LCD', 'Case', 'Nguồn', 'Tản nhiệt', 'Gear', 'Khác'];

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">BT</div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Hệ Thống Điều Phối & Quản Lý Hàng Hóa</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Chi nhánh Bình Thạnh • Smart Coordination</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-slate-300 uppercase tracking-tight">Đồng bộ: Real-time</span>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              id="search-input"
              type="text"
              placeholder="Tìm mã hàng..."
              className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 text-xs rounded-md focus:outline-none focus:border-emerald-500 transition-all w-48"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            id="refresh-button"
            onClick={fetchData}
            disabled={syncing}
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
          >
            <RefreshCcw className={cn(syncing && "animate-spin")} size={16} />
          </button>
          
          <button 
            onClick={() => handleSync('GLOBAL_SYNC', {})}
            disabled={syncing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <span>XÁC NHẬN ĐỒNG BỘ</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r border-slate-800 bg-[#020617] flex flex-col p-4 shadow-xl">
          <nav className="space-y-1 flex-1" role="tablist">
            <div className="text-[10px] font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Main Dashboard</div>
            <TabButton active={activeTab === 'overview'} icon={LayoutDashboard} label="Tổng quan" onClick={() => setActiveTab('overview')} />
            <TabButton active={activeTab === 'restock'} icon={ShoppingCart} label="Gợi ý Kéo hàng" onClick={() => setActiveTab('restock')} />
            <TabButton active={activeTab === 'display'} icon={Monitor} label="Quản lý Trưng bày" onClick={() => setActiveTab('display')} />
            
            <div className="text-[10px] font-semibold text-slate-500 mt-6 mb-2 px-2 uppercase tracking-wider">Phân nhóm hàng</div>
            <div className="space-y-1 overflow-y-auto max-h-[300px] no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "w-full flex justify-between px-3 py-1.5 text-xs rounded transition-all",
                    categoryFilter === cat 
                      ? "bg-slate-800 text-emerald-400 font-bold" 
                      : "text-slate-400 hover:bg-slate-900"
                  )}
                >
                  <span>{cat}</span>
                  <span className="bg-slate-900 px-1.5 rounded text-[10px] text-slate-500">
                    {(data.BT || []).length > 0 ? (cat === 'All' ? data.BT.length : data.BT.filter(p => categorizeProduct(p.name) === cat).length) : 0}
                  </span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setActiveTab('hot')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 mt-4 rounded-md text-sm font-medium transition-all",
                activeTab === 'hot' ? "bg-rose-900/20 text-rose-400" : "text-slate-400 hover:bg-slate-900"
              )}
            >
              <Flame size={18} />
              Hàng Hot / KM
            </button>
          </nav>

          <div className="mt-auto p-3 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Trạng thái Cache</div>
            <div className="w-full bg-slate-800 h-1 rounded-full mb-1">
              <div className="bg-emerald-500 w-3/4 h-1 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            </div>
            <div className="text-[9px] text-slate-400">7.2MB / 10MB Used</div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 flex flex-col p-6 bg-[#020617] overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <OverviewTab data={data} searchQuery={searchQuery} categoryFilter={categoryFilter} />
              </motion.div>
            )}
            {activeTab === 'restock' && (
              <motion.div 
                key="restock"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <RestockTab data={data} searchQuery={searchQuery} categoryFilter={categoryFilter} />
              </motion.div>
            )}
            {activeTab === 'display' && (
              <motion.div 
                key="display"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <DisplayTab data={data} searchQuery={searchQuery} handleSync={handleSync} syncing={syncing} />
              </motion.div>
            )}
            {activeTab === 'hot' && (
              <motion.div 
                key="hot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <HotTab data={data} searchQuery={searchQuery} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-8 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-4 text-[10px] text-slate-500">
        <div className="flex gap-4">
          <span>Session: <span className="text-slate-300">Active</span></span>
          <span>User: <span className="text-slate-300">Senior_Dev_GAS</span></span>
          <span>Branch: <span className="text-slate-300 uppercase font-bold">Bình Thạnh</span></span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-mono text-slate-400 italic">v2.4.0-Stable_Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Tab Components ---

function OverviewTab({ data, searchQuery, categoryFilter }: { data: InventoryData, searchQuery: string, categoryFilter: Category | 'All' }) {
  const btInventory = data.BT || [];
  
  const filtered = btInventory.filter(p => {
    const matchesSearch = p.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || categorizeProduct(p.name) === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl">
              <Store size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Tổng SKU tại BT</p>
              <h3 className="text-2xl font-bold text-white">{btInventory.length}</h3>
              <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp size={10} /> +12% so với hôm qua
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Tổng tồn kho</p>
              <h3 className="text-2xl font-bold text-white">{btInventory.reduce((acc, p) => acc + p.stock, 0)}</h3>
              <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">Cập nhật 2 phút trước</div>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">SKU sắp hết hàng</p>
              <h3 className="text-2xl font-bold text-white">{btInventory.filter(p => p.stock < p.maxStock * 0.2).length}</h3>
              <div className="text-[10px] text-rose-400 mt-1 italic tracking-tight underline">Xem danh sách ưu tiên</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-slate-800 rounded-xl bg-[#0f172a] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
          <h3 className="text-sm font-bold tracking-tight">Danh mục hàng hóa tại Bình Thạnh</h3>
          <div className="text-[10px] text-slate-500 bg-slate-950/50 px-2 py-1 rounded border border-slate-800">
            Hiển thị {filtered.length} / {btInventory.length} SKU
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900/50 text-slate-400">
              <tr className="uppercase tracking-widest font-semibold p-3 border-b border-slate-800">
                <th className="px-6 py-3 border-b border-slate-800">Nhóm</th>
                <th className="px-6 py-3 border-b border-slate-800">Mã hàng</th>
                <th className="px-6 py-3 border-b border-slate-800">Tên sản phẩm</th>
                <th className="px-6 py-3 border-b border-slate-800">Giá bán</th>
                <th className="px-6 py-3 border-b border-slate-800">Tồn kho / Max</th>
                <th className="px-6 py-3 border-b border-slate-800 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(p => {
                const stockRatio = p.stock / p.maxStock;
                return (
                  <tr key={p.sku} className="hover:bg-slate-800/40 transition-all">
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        {categorizeProduct(p.name)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{p.sku}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-100 font-medium line-clamp-1">{p.name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{formatCurrency(p.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,255,255,0.1)]",
                              stockRatio < 0.2 ? "bg-rose-500" : stockRatio < 0.5 ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(100, stockRatio * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-white leading-none">{p.stock}</span>
                        <span className="text-[10px] text-slate-500">/ {p.maxStock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {stockRatio < 0.2 ? (
                        <Badge variant="warning">Nhập ngay</Badge>
                      ) : (
                        <Badge variant="default">An toàn</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    Không tìm thấy hàng hóa nào trong kho BT.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RestockTab({ data, searchQuery, categoryFilter }: { data: InventoryData, searchQuery: string, categoryFilter: Category | 'All' }) {
  const mainStock = data['64'] || [];
  const lStock = data['7bc'] || [];
  const btStock = data['BT'] || [];
  const stats = data['tk'] || [];

  const suggestions = stats.map(s => {
    const btItem = btStock.find(p => p.sku === s.sku);
    const mainItem = mainStock.find(p => p.sku === s.sku) || lStock.find(p => p.sku === s.sku);
    
    if (!mainItem) return null;

    const currentStock = btItem ? btItem.stock : 0;
    const maxStock = btItem ? btItem.maxStock : 10;
    const sales7d = (s.sales30d / 30) * 7;
    
    let suggestedQty = Math.ceil(sales7d + s.soPending - currentStock);

    if (currentStock === 0 && s.sales30d === 0) {
      if (mainItem.price > 30000000) suggestedQty = 1;
      else if (mainItem.price < 500000) suggestedQty = 2;
      else suggestedQty = 1;
    }

    if (currentStock + suggestedQty > maxStock) {
      suggestedQty = maxStock - currentStock;
    }

    if (suggestedQty <= 0) return null;

    const warehouse64 = mainStock.find(p => p.sku === s.sku);
    const warehouse7bc = lStock.find(p => p.sku === s.sku);
    const primarySource = (warehouse64 && warehouse64.stock > 0) ? '64' : '7bc';
    const sourceStock = primarySource === '64' ? warehouse64?.stock || 0 : warehouse7bc?.stock || 0;

    return {
      ...mainItem,
      suggestedQty,
      sales7d: Math.round(sales7d * 10) / 10,
      soPending: s.soPending,
      currentStock,
      source: primarySource,
      sourceStock,
      promo: s.promo,
      isHot: (s.intImp + s.intExp) > 10
    };
  }).filter((s): s is any => s !== null && (categoryFilter === 'All' || categorizeProduct(s.name) === categoryFilter))
    .filter(s => s.sku.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <ShoppingCart size={24} className="text-emerald-500" />
            Gợi ý Kéo hàng (Logic Thông minh)
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Phân tích Sức bán 7 ngày & SO Pending</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded-xl">
             <p className="text-[10px] text-amber-500 font-bold uppercase">SO Pending</p>
             <p className="text-xl font-black text-amber-500">{suggestions.reduce((acc, s) => acc + s.soPending, 0)}</p>
          </div>
          <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-xl">
            <p className="text-[10px] text-emerald-400 font-bold uppercase">Tổng gợi ý</p>
            <p className="text-xl font-black text-emerald-400">+{suggestions.reduce((acc, s) => acc + s.suggestedQty, 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {suggestions.map(s => (
          <div key={s.sku} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group shadow-sm">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-800 transition-colors">
                <Package className="text-slate-600 group-hover:text-emerald-400" size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={s.isHot ? 'hot' : s.promo ? 'promo' : 'default'}>
                    {s.isHot ? 'HOT' : s.promo ? 'CTKM' : categorizeProduct(s.name)}
                  </Badge>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{s.sku}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-100 line-clamp-1 mb-1">{s.name}</h4>
                <p className="text-xs text-emerald-400 font-bold">{formatCurrency(s.price)}</p>
              </div>
              <div className="text-right">
                <div className="bg-emerald-500 text-white px-3 py-1 rounded-md shadow-lg shadow-emerald-500/20">
                  <span className="text-[8px] block font-bold leading-none opacity-80 uppercase mb-0.5">Kéo</span>
                  <span className="text-lg font-black leading-none">+{s.suggestedQty}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-y border-slate-800 border-dashed">
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Sức bán 7n</p>
                <p className="text-xs font-bold text-slate-300">{s.sales7d}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase">SO Pending</p>
                <p className="text-xs font-bold text-amber-500">{s.soPending}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Tồn Hiện tại</p>
                <p className="text-xs font-bold text-rose-500">{s.currentStock}</p>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Kho Nguồn: {s.source}</span>
                <span className="text-[10px] text-blue-400 font-bold">Hiện có: {s.sourceStock}</span>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-widest">
                Chi tiết <ChevronRight size={12} />
              </button>
            </div>
          </div>
        ))}
        {suggestions.length === 0 && (
          <div className="lg:col-span-2 py-20 text-center bg-slate-950/30 rounded-2xl border border-slate-800 border-dashed">
            <Package size={48} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-500 font-medium">Hệ thống không tìm thấy mã hàng nào cần kéo thêm.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DisplayTab({ data, searchQuery, handleSync, syncing }: { data: InventoryData, searchQuery: string, handleSync: (type: string, payload: any) => void, syncing: boolean }) {
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [editingDates, setEditingDates] = useState<Record<string, string>>({});

  const displayStock = data.Tba || [];
  const displayTimes = data['Data Tba'] || [];
  const stats = data.tk || [];
  const btStock = data.BT || [];

  const displaySuggestions = stats.filter(s => {
    const isHot = (s.intImp + s.intExp) > 10;
    const isPromo = s.promo;
    const isOnDisplay = displayTimes.some(di => di.sku === s.sku);
    const hasInBT = btStock.find(p => p.sku === s.sku);
    return (isHot || isPromo) && !isOnDisplay && hasInBT;
  }).map(s => {
    const tbaItem = displayStock.find(p => p.sku === s.sku);
    return {
      ...s,
      missingMaxStock: !tbaItem || !tbaItem.maxStock || tbaItem.maxStock === 0
    };
  });

  const onSync = async (type: string, payload: any) => {
    await handleSync(type, payload);
    if (type === 'DataTba_UPDATE') {
      if (payload.note !== undefined) {
        setEditingNotes(prev => {
          const next = { ...prev };
          delete next[payload.sku];
          return next;
        });
      }
      if (payload.startedAt !== undefined) {
        setEditingDates(prev => {
          const next = { ...prev };
          delete next[payload.sku];
          return next;
        });
      }
    }
  };

  const filteredItems = displayTimes.filter(item => 
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).map(item => {
    const stockItem = displayStock.find(p => p.sku === item.sku);
    return {
      ...item,
      stock: stockItem?.stock || 0,
      maxStock: stockItem?.maxStock || 0
    };
  });

  return (
    <div className="space-y-8">
      <div className="bg-amber-900/10 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group">
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2">
            <Monitor size={24} />
            Quản lý Trưng bày (Tba)
          </h2>
          <p className="text-amber-200/60 text-sm mt-1 max-w-lg">Theo dõi thời gian trưng bày hiệu quả để tối ưu hóa không gian Store.</p>
        </div>
        <Monitor className="absolute -right-10 -bottom-10 text-amber-500/10 group-hover:scale-110 transition-transform duration-700" size={180} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-slate-100">
              <ChevronUp size={20} className="text-emerald-400" />
              Gợi ý lên kệ (HOT/KM)
            </h3>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">{displaySuggestions.length}</span>
          </div>
          <div className="space-y-3">
            {displaySuggestions.map(s => (
              <div key={s.sku} className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 shadow-sm flex justify-between items-center group/item hover:border-slate-700 transition-all">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-slate-100 truncate">{s.name}</h4>
                    {s.missingMaxStock && (
                      <div className="flex items-center gap-1 text-[9px] text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded border border-rose-400/20 animate-pulse">
                        <AlertCircle size={10} /> THIẾU TỒN MAX
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {s.promo && <Badge variant="promo">CTKM</Badge>}
                    {(s.intImp + s.intExp) > 10 && <Badge variant="hot">HOT</Badge>}
                  </div>
                </div>
                <button 
                  onClick={() => onSync('DataTba_UPDATE', { sku: s.sku, name: s.name, startedAt: new Date().toISOString() })}
                  disabled={syncing}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-500 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 shrink-0"
                >
                  Lên kệ
                </button>
              </div>
            ))}
            {displaySuggestions.length === 0 && (
              <div className="text-center py-12 bg-slate-950/20 rounded-xl border border-slate-800 border-dashed">
                <p className="text-slate-500 text-sm italic">Không có gợi ý lên kệ mới.</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-slate-100">
              <Store size={20} className="text-blue-400" />
              Đang trưng bày
            </h3>
          </div>
          <div className="bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/50 border-b border-slate-800">
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-4 py-3">Sản phẩm / Ghi chú</th>
                  <th className="px-4 py-3 text-center">Tồn / Max</th>
                  <th className="px-4 py-3 text-center">Thời gian</th>
                  <th className="px-4 py-3 text-right">Tình trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.map(item => {
                  const days = differenceInDays(new Date(), parseISO(item.startedAt));
                  const isCritical = days >= 30;
                  const isWarning = days >= 20 && days < 30;
                  
                  return (
                    <tr key={item.sku} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-slate-100 truncate max-w-[200px]">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-slate-500">{item.sku}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 group/note">
                          <MessageSquare size={12} className="text-slate-500" />
                          <input 
                            type="text"
                            placeholder="Thêm ghi chú..."
                            value={editingNotes[item.sku] ?? item.note ?? ''}
                            onChange={(e) => setEditingNotes(prev => ({ ...prev, [item.sku]: e.target.value }))}
                            className="bg-transparent border-b border-transparent group-hover/note:border-slate-700 focus:border-emerald-500 focus:outline-none text-[11px] text-slate-400 w-full transition-all"
                          />
                          {(editingNotes[item.sku] !== undefined && editingNotes[item.sku] !== item.note) && (
                            <button 
                              onClick={() => onSync('DataTba_UPDATE', { sku: item.sku, name: item.name, note: editingNotes[item.sku] })}
                              disabled={syncing}
                              className="text-emerald-500 hover:text-emerald-400"
                            >
                              <Save size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <p className="text-sm font-bold text-white">{item.stock}</p>
                        <p className="text-[9px] text-slate-500">MAX: {item.maxStock || '?'}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2 group/date">
                            <input 
                              type="date"
                              value={(editingDates[item.sku] ?? item.startedAt).split('T')[0]}
                              onChange={(e) => setEditingDates(prev => ({ ...prev, [item.sku]: new Date(e.target.value).toISOString() }))}
                              className="bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-[10px] text-slate-300 focus:outline-none focus:border-emerald-500"
                            />
                            {(editingDates[item.sku] !== undefined && editingDates[item.sku] !== item.startedAt) && (
                              <button 
                                onClick={() => onSync('DataTba_UPDATE', { sku: item.sku, name: item.name, startedAt: editingDates[item.sku] })}
                                disabled={syncing}
                                className="text-emerald-500 hover:text-emerald-400"
                              >
                                <Save size={12} />
                              </button>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-500 uppercase font-bold">{days} ngày</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {isCritical ? (
                          <div className="flex flex-col items-end">
                            <Badge variant="warning">Hạ kệ ưu tiên</Badge>
                            <span className="text-[9px] text-rose-400 font-bold mt-1 uppercase animate-pulse">Quá 30 ngày</span>
                          </div>
                        ) : isWarning ? (
                          <div className="flex flex-col items-end">
                            <div className="bg-amber-500/20 text-amber-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                              Lưu ý hạ kệ
                            </div>
                            <span className="text-[9px] text-amber-500 mt-1 uppercase font-medium">Sắp tới hạn</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <div className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/10">
                              Ổn định
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function HotTab({ data, searchQuery }: { data: InventoryData, searchQuery: string }) {
  const stats = data.tk || [];
  
  const hotItems = stats.filter(s => (s.intImp + s.intExp) > 10)
    .filter(s => s.sku.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const promoItems = stats.filter(s => s.promo)
    .filter(s => s.sku.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-rose-400 uppercase tracking-widest">
          <Flame size={20} />
          Hàng Hot (Traffic nội bộ)
        </h3>
        <div className="space-y-4">
          {hotItems.map(s => (
            <div key={s.sku} className="bg-[#0f172a] p-5 rounded-2xl border-l-4 border-rose-500 shadow-md group hover:bg-slate-800/50 transition-all">
              <h4 className="font-bold text-sm text-slate-100 leading-tight mb-3">{s.name}</h4>
              <div className="flex justify-between items-end">
                <div className="flex gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Nhập Nội Bộ</p>
                    <p className="text-base font-black text-emerald-400">+{s.intImp}</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Xuất Nội Bộ</p>
                    <p className="text-base font-black text-rose-400">-{s.intExp}</p>
                  </div>
                </div>
                <Badge variant="hot">Mức độ: Rất Cao</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-amber-400 uppercase tracking-widest">
          <TrendingUp size={20} />
          Chiến dịch KM (Promo)
        </h3>
        <div className="space-y-4">
          {promoItems.map(s => (
            <div key={s.sku} className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 hover:border-amber-500/30 shadow-md relative overflow-hidden group transition-all">
              <h4 className="font-bold text-sm text-slate-100 leading-tight relative z-10 mb-3">{s.name}</h4>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Bán lẻ 30 ngày</span>
                  <span className="text-sm font-black text-white">{s.sales30d} <span className="text-[10px] font-normal text-slate-500">đơn vị</span></span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="promo">V2 PROMO</Badge>
                </div>
              </div>
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/5 rounded-full z-0 group-hover:scale-150 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
