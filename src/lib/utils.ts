import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function categorizeProduct(name: string) {
  const n = name.toUpperCase();
  if (n.includes('CPU')) return 'CPU';
  if (n.includes('MAIN') || n.includes('BO MẠCH')) return 'Mainboard';
  if (n.includes('RAM') || n.includes('BỘ NHỚ')) return 'RAM';
  if (n.includes('SSD') || n.includes('Ổ CỨNG')) return 'SSD';
  if (n.includes('LCD') || n.includes('MÀN HÌNH')) return 'LCD';
  if (n.includes('CASE') || n.includes('VỎ CASE')) return 'Case';
  if (n.includes('NGUỒN') || n.includes('PSU')) return 'Nguồn';
  if (n.includes('TẢN') || n.includes('COOL')) return 'Tản nhiệt';
  if (n.includes('GEAR') || n.includes('CHUỘT') || n.includes('PHÍM')) return 'Gear';
  return 'Khác';
}
