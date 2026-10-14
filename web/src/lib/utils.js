import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Menggabungkan kelas Tailwind (pola shadcn).
 * @param {...any} inputs
 * @returns {string}
 */
export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

/** Format angka gaya Indonesia: 1234.5 -> "1.234,5" */
export function num(v, digits = 2) {
	if (v === null || v === undefined || Number.isNaN(v)) return '–';
	return Number(v).toLocaleString('id-ID', {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	});
}
