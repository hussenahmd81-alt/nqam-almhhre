/**
 * Lamasat Al-Meamar ERP - Financial Math & Arabic Numerals Utilities
 * Configured for Iraqi Dinar (د.ع / IQD)
 * Provides precise monetary calculations, Arabic number-to-words (Tafqeet), and QR code generation.
 */

export const CURRENCY_SYMBOL = 'د.ع';
export const CURRENCY_NAME = 'دينار عراقي';

// Precise currency rounding
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(value: number, includeCurrency = true): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);

  return includeCurrency ? `${formatted} د.ع` : formatted;
}

export const formatIQD = formatCurrency;
export const formatSAR = formatCurrency; // Alias for backward compatibility

/**
 * Arabic Number to Words (Tafqeet) for Official Invoices and Receipts in Iraqi Dinar
 */
const ones = [
  '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة',
  'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'
];

const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];

const hundreds = [
  '', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'
];

function convertGroup(num: number): string {
  let result = '';
  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const o = num % 10;
  const rem = num % 100;

  if (h > 0) {
    result += hundreds[h];
  }

  if (rem > 0) {
    if (h > 0) result += ' و';
    if (rem < 20) {
      result += ones[rem];
    } else {
      if (o > 0) {
        result += ones[o] + ' و' + tens[t];
      } else {
        result += tens[t];
      }
    }
  }

  return result;
}

export function tafqeetIQD(amount: number): string {
  if (amount === 0) return 'صفر دينار عراقي لا غير';
  if (amount < 0) return 'سالب ' + tafqeetIQD(Math.abs(amount));

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 1000); // فلس

  let parts: string[] = [];

  const billions = Math.floor(integerPart / 1_000_000_000);
  const millions = Math.floor((integerPart % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1_000);
  const remainder = integerPart % 1_000;

  if (billions > 0) {
    if (billions === 1) parts.push('مليار');
    else if (billions === 2) parts.push('ملياران');
    else parts.push(`${convertGroup(billions)} مليار`);
  }

  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else parts.push(`${convertGroup(millions)} مليون`);
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else parts.push(`${convertGroup(thousands)} ألف`);
  }

  if (remainder > 0) {
    parts.push(convertGroup(remainder));
  }

  let text = 'فقط ' + parts.join(' و') + ' دينار عراقي';

  if (decimalPart > 0) {
    text += ` و${convertGroup(decimalPart)} فلس`;
  }

  text += ' لا غير';
  return text;
}

export const tafqeetSAR = tafqeetIQD; // Alias
export const taqeetArabicMoney = tafqeetIQD;

/**
 * QR simulation for e-invoicing verification in IQD
 */
export function generateZatcaQrData(
  sellerName: string,
  vatRegistrationNumber: string,
  timestamp: string,
  invoiceTotal: number,
  vatTotal: number
): string {
  return `ERP-QR|CURRENCY=IQD|SELLER=${sellerName}|REG=${vatRegistrationNumber}|TIME=${timestamp}|TOTAL=${roundMoney(invoiceTotal)}|TAX=${roundMoney(vatTotal)}`;
}
