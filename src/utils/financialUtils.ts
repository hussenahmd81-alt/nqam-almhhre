/**
 * Lamasat Al-Meamar ERP - Financial Math & Arabic Numerals Utilities
 * Configured for Iraqi Dinar (د.ع / IQD)
 * Provides precise monetary calculations, Arabic number-to-words (Tafqeet), and QR code generation.
 */

export const CURRENCY_SYMBOL = 'د.ع';
export const CURRENCY_NAME = 'دينار عراقي';

// Precise currency rounding
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function nonNegative(value: number): number {
  return roundMoney(Math.max(0, Number(value) || 0));
}

export function clampPercent(value: number): number {
  return Math.min(100, nonNegative(value));
}

export function sumMoney(values: number[]): number {
  return roundMoney(values.reduce((sum, value) => sum + (Number(value) || 0), 0));
}

export function calculateCashTotals(
  openingBalance: number,
  vouchers: Array<{ type: 'cash_in' | 'cash_out'; amount: number; paymentMethod?: string }>
) {
  const cashOnly = vouchers.filter((voucher) => !voucher.paymentMethod || voucher.paymentMethod === 'cash');
  const totalCashIn = sumMoney(
    cashOnly.filter((voucher) => voucher.type === 'cash_in').map((voucher) => nonNegative(voucher.amount))
  );
  const totalCashOut = sumMoney(
    cashOnly.filter((voucher) => voucher.type === 'cash_out').map((voucher) => nonNegative(voucher.amount))
  );

  return {
    totalCashIn,
    totalCashOut,
    liveSafeBalance: roundMoney(nonNegative(openingBalance) + totalCashIn - totalCashOut)
  };
}

export function calculateInvoiceTotals(
  items: Array<{ quantity: number; unitPrice: number }>,
  discountPercent: number,
  taxRate: number
) {
  const normalizedItems = items.map((item) => ({
    quantity: nonNegative(item.quantity),
    unitPrice: nonNegative(item.unitPrice),
    total: roundMoney(nonNegative(item.quantity) * nonNegative(item.unitPrice))
  }));
  const subtotal = sumMoney(normalizedItems.map((item) => item.total));
  const safeDiscountPercent = clampPercent(discountPercent);
  const safeTaxRate = clampPercent(taxRate);
  const discountAmount = roundMoney(subtotal * (safeDiscountPercent / 100));
  const taxableAmount = roundMoney(Math.max(0, subtotal - discountAmount));
  const taxAmount = roundMoney(taxableAmount * (safeTaxRate / 100));
  const grandTotal = roundMoney(taxableAmount + taxAmount);

  return {
    items: normalizedItems,
    subtotal,
    discountPercent: safeDiscountPercent,
    discountAmount,
    taxableAmount,
    taxRate: safeTaxRate,
    taxAmount,
    grandTotal
  };
}

export function calculateInvoicePayment(grandTotal: number, requestedPaidAmount: number) {
  const total = nonNegative(grandTotal);
  const paidAmount = Math.min(total, nonNegative(requestedPaidAmount));
  const remainingAmount = roundMoney(Math.max(0, total - paidAmount));
  const status = remainingAmount === 0 ? 'paid' : paidAmount > 0 ? 'partially_paid' : 'pending';
  return { paidAmount, remainingAmount, status } as const;
}

export function calculateEmployeePackage(
  basicSalary: number,
  housingAllowance: number,
  transportAllowance: number,
  otherAllowances: number
) {
  return sumMoney([
    nonNegative(basicSalary),
    nonNegative(housingAllowance),
    nonNegative(transportAllowance),
    nonNegative(otherAllowances)
  ]);
}

export function calculateMonthlySalary(input: {
  basicSalary: number;
  totalAllowances: number;
  overtimeAmount: number;
  bonuses: number;
  advancesDeduction: number;
  absenceDeduction: number;
  penaltiesDeduction: number;
}) {
  const grossPay = sumMoney([
    nonNegative(input.basicSalary),
    nonNegative(input.totalAllowances),
    nonNegative(input.overtimeAmount),
    nonNegative(input.bonuses)
  ]);
  const totalDeductions = sumMoney([
    nonNegative(input.advancesDeduction),
    nonNegative(input.absenceDeduction),
    nonNegative(input.penaltiesDeduction)
  ]);
  return {
    grossPay,
    totalDeductions,
    netPayable: roundMoney(Math.max(0, grossPay - totalDeductions))
  };
}

export function calculateWeeklyWorkerPay(input: {
  days: number[];
  dailyRate: number;
  overtimeHours: number;
  overtimeRate: number;
  advances: number;
}) {
  const totalDays = roundMoney(
    input.days.reduce((sum, value) => sum + Math.min(1, nonNegative(value)), 0)
  );
  const overtimeHours = nonNegative(input.overtimeHours);
  const overtimeAmount = roundMoney(overtimeHours * nonNegative(input.overtimeRate));
  const totalEarned = roundMoney(totalDays * nonNegative(input.dailyRate) + overtimeAmount);
  const advances = nonNegative(input.advances);
  const netPayable = roundMoney(Math.max(0, totalEarned - advances));
  return { totalDays, overtimeHours, overtimeAmount, advances, totalEarned, netPayable };
}

export function calculateWeeklyTotals(
  entries: Array<{ totalEarned: number; advances: number; netPayable: number }>
) {
  return {
    totalWeeklyGross: sumMoney(entries.map((entry) => entry.totalEarned)),
    totalWeeklyAdvances: sumMoney(entries.map((entry) => entry.advances)),
    totalWeeklyNetPayable: sumMoney(entries.map((entry) => entry.netPayable))
  };
}

export function calculateQuantityTotal(quantity: number, unitPrice: number): number {
  return roundMoney(nonNegative(quantity) * nonNegative(unitPrice));
}

export function calculateFuelMetrics(input: {
  liters: number;
  costPerLiter: number;
  currentOdometer: number;
  previousOdometer: number;
  isHourly: boolean;
  standardBenchmarkRate: number;
}) {
  const liters = nonNegative(input.liters);
  const distanceOrHours = roundMoney(
    Math.max(0, nonNegative(input.currentOdometer) - nonNegative(input.previousOdometer))
  );
  const totalAmount = calculateQuantityTotal(liters, input.costPerLiter);
  const consumptionRate =
    distanceOrHours > 0
      ? roundMoney(input.isHourly ? liters / distanceOrHours : (liters / distanceOrHours) * 100)
      : 0;
  const benchmark = nonNegative(input.standardBenchmarkRate);
  const variancePercent =
    benchmark > 0 ? roundMoney(((consumptionRate - benchmark) / benchmark) * 100) : 0;
  const isAnomaly = benchmark > 0 && variancePercent > 35;
  return { liters, distanceOrHours, totalAmount, consumptionRate, benchmark, variancePercent, isAnomaly };
}

export function calculateLedgerBalance(totalBilled: number, totalPaid: number): number {
  return roundMoney(Math.max(0, nonNegative(totalBilled) - nonNegative(totalPaid)));
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
