export interface Product {
  sku: string;
  name: string;
  price: number;
  stock: number;
  maxStock: number;
}

export interface Stats {
  sku: string;
  name: string;
  sales30d: number;
  soPending: number;
  promo: boolean;
  intImp: number;
  intExp: number;
}

export interface DisplayTime {
  sku: string;
  name: string;
  startedAt: string;
  note?: string;
}

export interface InventoryData {
  '64': Product[];
  'BT': Product[];
  '7bc': Product[];
  'Tba': Product[]; // Tba is now a warehouse sheet with stock/maxStock
  'tk': Stats[];
  'Data Tba': DisplayTime[];
}

export type Category = 'CPU' | 'Mainboard' | 'RAM' | 'SSD' | 'LCD' | 'Case' | 'Nguồn' | 'Tản nhiệt' | 'Gear' | 'Khác';
