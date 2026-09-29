export type UserRole = 'super_admin' | 'accountant' | 'data_entry';

export interface RoleConfig {
  id: UserRole;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  descriptionAr: string;
  badgeColor: string;
  canViewFinancialReports: boolean;
  canViewConfidentialMargins: boolean;
  canCreateInvoice: boolean;
  canEditInvoice: boolean;
  canDeleteRecords: boolean;
  canApproveSubcontractorPayment: boolean;
  canLogDailySiteOperations: boolean;
  canManageLicense: boolean;
  canAccessAuditLogs: boolean;
  canExportData: boolean;
}

export interface UserProfile {
  id: string;
  nameAr: string;
  role: UserRole;
  title: string;
  email: string;
  phone: string;
  avatarLetter: string;
  branch: string;
}

export interface UserCredential {
  role: UserRole;
  pin: string;
  labelAr: string;
}

export interface LicenseInfo {
  licenseKey: string;
  clientName: string;
  commercialRegNumber: string;
  status: 'active' | 'expired' | 'invalid' | 'domain_mismatch';
  tier: string;
  issuedAt: string;
  expiresAt: string;
  daysRemaining: number;
  authorizedDomains: string[];
  boundDomain: string;
  hardwareFingerprint: string;
  signatureChecksum: string;
  maxSeats: number;
  activeSeats: number;
  enabledModules: string[];
  lastVerificationTime: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'financial' | 'license' | 'operations' | 'security';
  severity: 'info' | 'warning' | 'critical';
  ipAddress: string;
  details: string;
  diff?: {
    field: string;
    oldVal: string;
    newVal: string;
  };
}

export interface Project {
  id: string;
  code: string;
  nameAr: string;
  clientName: string;
  location: string;
  type: 'commercial' | 'residential' | 'villa' | 'tower';
  totalBudget: number;
  spentAmount: number;
  progressPercent: number;
  leadArchitect: string;
  status: 'in_progress' | 'finishing' | 'foundation' | 'completed';
  startDate: string;
  deliveryDate: string;
}

export interface FinancialTransaction {
  id: string;
  invoiceNumber: string;
  date: string;
  projectId: string;
  projectName: string;
  recipientName: string;
  category: 'subcontractor' | 'materials' | 'petty_cash' | 'payroll' | 'equipment';
  amount: number;
  vatAmount: number;
  status: 'approved' | 'pending' | 'rejected';
  createdBy: string;
  approvedBy?: string;
  notes?: string;
}

export interface SiteOperationLog {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  equipmentType: string;
  machineryId: string;
  fuelLiters: number;
  fuelCost: number;
  workersCount: number;
  workDescription: string;
  loggedBy: string;
  verifiedBySupervisor: boolean;
}

export type CashVoucherType = 'cash_in' | 'cash_out';

export type CashInCategory = 'contract_payment' | 'client_settlement' | 'internal_financing' | 'other_income';
export type CashOutCategory = 'subcontractor' | 'materials' | 'petty_cash' | 'fuel_maintenance' | 'daily_wages' | 'payroll' | 'utilities';
export type CashVoucherCategory = CashInCategory | CashOutCategory;

export type PaymentMethod = 'cash' | 'bank_transfer' | 'check';

export interface CashVoucher {
  id: string;
  voucherNumber: string;
  type: CashVoucherType;
  date: string;
  time: string;
  amount: number;
  category: CashVoucherCategory;
  categoryLabelAr: string;
  paymentMethod: PaymentMethod;
  partyName: string;
  partyType?: 'client' | 'subcontractor' | 'supplier' | 'employee' | 'laborer' | 'government' | 'other';
  projectId?: string;
  projectName?: string;
  description: string;
  recordedBy: string;
  approvedBy?: string;
  referenceDocNumber?: string;
  notes?: string;
}

export interface DailySafeRegister {
  id: string;
  date: string;
  openingBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  expectedSystemBalance: number;
  actualPhysicalCount: number;
  difference: number;
  status: 'balanced' | 'shortage' | 'surplus';
  closedAt: string;
  closedBy: string;
  notes: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceType = 'sales' | 'purchase';
export type InvoiceStatus = 'paid' | 'partially_paid' | 'pending' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  date: string;
  dueDate: string;
  clientName: string;
  clientPhone?: string;
  clientVatNumber?: string;
  clientAddress?: string;
  projectId?: string;
  projectName?: string;
  contractRef?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  paymentTerms: string;
  notes: string;
  createdBy: string;
  qrCodeData: string;
}

// -------------------------------------------------------------
// TASK 5: PAYROLL & WORKFORCE MANAGEMENT TYPES
// -------------------------------------------------------------

export interface Employee {
  id: string;
  code: string;
  nameAr: string;
  nationalId: string;
  roleTitle: string;
  department: 'engineering' | 'finance' | 'projects' | 'administration' | 'logistics';
  departmentAr: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  totalMonthlyPackage: number;
  bankName: string;
  iban: string;
  hireDate: string;
  phone: string;
  status: 'active' | 'on_leave' | 'terminated';
  assignedProjectId?: string;
  assignedProjectName?: string;
}

export interface MonthlySalarySlip {
  id: string;
  slipNumber: string;
  employeeId: string;
  employeeName: string;
  roleTitle: string;
  departmentAr: string;
  monthYear: string; // e.g. "2026-09"
  basicSalary: number;
  totalAllowances: number;
  overtimeHours: number;
  overtimeAmount: number;
  bonuses: number;
  advancesDeduction: number;
  absenceDays: number;
  absenceDeduction: number;
  penaltiesDeduction: number;
  netPayable: number;
  status: 'draft' | 'approved' | 'paid';
  paidAt?: string;
  paidViaCashVoucherId?: string;
  notes?: string;
}

export interface ProjectWorker {
  id: string;
  code: string;
  nameAr: string;
  craft: string; // "نجار مسلح" | "حداد تسليح" | "بناء" | "مليس" | "عامل تشغيل" | "فني كهرباء" | "سباك إنشائي"
  phone: string;
  nationalId: string;
  dailyRate: number; // الأجر اليومي
  projectId: string;
  projectName: string;
  status: 'active' | 'inactive';
}

export interface WorkerWeekEntry {
  workerId: string;
  workerName: string;
  craft: string;
  dailyRate: number;
  days: {
    sat: number; // 0, 0.5, 1
    sun: number;
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
  };
  totalDays: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimeAmount: number;
  advances: number; // السلف المستلمة خلال الأسبوع
  totalEarned: number;
  netPayable: number;
  isPaid: boolean;
}

export interface WeeklyLaborTimesheet {
  id: string;
  weekCode: string; // e.g. "WK-2026-38"
  weekStartDate: string;
  weekEndDate: string;
  projectId: string;
  projectName: string;
  supervisorName: string;
  entries: WorkerWeekEntry[];
  totalWeeklyGross: number;
  totalWeeklyAdvances: number;
  totalWeeklyNetPayable: number;
  status: 'draft' | 'approved' | 'paid';
  paidAt?: string;
  paidViaCashVoucherId?: string;
  notes?: string;
}

// -------------------------------------------------------------
// TASK 6: OPERATIONAL & LOGISTICAL EXPENSES TYPES
// -------------------------------------------------------------

export type ProcurementCategory = 'site_materials' | 'tools' | 'safety' | 'consumables' | 'emergency';

export interface DailyProcurementItem {
  id: string;
  purchaseNumber: string;
  date: string;
  itemName: string;
  category: ProcurementCategory;
  categoryAr: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  supplierShop: string;
  buyerName: string;
  projectId?: string;
  projectName?: string;
  isInternalOffice: boolean;
  paymentMethod: 'cash_safe' | 'bank_transfer' | 'petty_cash';
  invoicePhotoUrl?: string;
  hasInvoicePhoto: boolean;
  notes?: string;
  linkedCashVoucherId?: string;
  recordedBy: string;
}

export type FuelType = 'gasoline_91' | 'gasoline_95' | 'diesel';

export interface FuelFleetLog {
  id: string;
  logNumber: string;
  date: string;
  vehicleName: string;
  plateNumber: string;
  vehicleType: 'truck' | 'pickup' | 'passenger_van' | 'heavy_machinery' | 'generator';
  driverOrOperator: string;
  fuelType: FuelType;
  liters: number;
  costPerLiter: number;
  totalAmount: number;
  currentOdometer: number; // KM or Hours
  previousOdometer: number;
  distanceOrHours: number;
  consumptionRate: number; // L/100km or L/Hour
  standardBenchmarkRate: number; // المعدل المعياري
  isAnomaly: boolean; // استهلاك غير طبيعي أو هدر
  anomalyReason?: string;
  gasStation: string;
  projectId: string;
  projectName: string;
  paymentMethod: 'cash_safe' | 'fuel_card' | 'bank_transfer';
  linkedCashVoucherId?: string;
  loggedBy: string;
}

export type OfficeExpenseCategory =
  | 'rent'
  | 'electricity_water'
  | 'internet_telecom'
  | 'hospitality'
  | 'it_software'
  | 'maintenance'
  | 'government_fees'
  | 'stationery';

export interface OfficeOverheadExpense {
  id: string;
  expenseNumber: string;
  date: string;
  category: OfficeExpenseCategory;
  categoryAr: string;
  title: string;
  amount: number;
  paymentMethod: 'cash_safe' | 'bank_transfer' | 'check';
  recipientOrVendor: string;
  receiptDocRef?: string;
  notes?: string;
  linkedCashVoucherId?: string;
  recordedBy: string;
}

// -------------------------------------------------------------
// TASK 7: SUBCONTRACTORS, VENDORS & RENTAL MACHINERY TYPES
// -------------------------------------------------------------

export type VendorType = 'subcontractor' | 'material_supplier' | 'equipment_lessor' | 'service_provider';

export interface SubcontractorVendor {
  id: string;
  vendorNumber: string;
  name: string;
  type: VendorType;
  typeAr: string;
  specialty: string;
  phone: string;
  email?: string;
  commercialReg?: string;
  vatNumber?: string;
  contactPerson: string;
  assignedProjectIds: string[];
  totalBilled: number; // إجمالي الفواتير والمستخلصات (دائن)
  totalPaid: number;   // إجمالي الدفعات المسددة (مدين)
  currentBalance: number; // الرصيد المتبقي بذمة الشركة
  paymentTermDays: number;
  status: 'active' | 'suspended' | 'settled';
  notes?: string;
}

export type VendorTransactionType = 'bill' | 'payment';

export interface VendorTransaction {
  id: string;
  transactionNumber: string;
  vendorId: string;
  vendorName: string;
  date: string;
  type: VendorTransactionType; // bill = مستخلص/فاتورة (دائن), payment = سند صرف/دفعة (مدين)
  amount: number;
  projectId?: string;
  projectName?: string;
  referenceDocNumber?: string;
  paymentMethod?: 'cash_safe' | 'bank_transfer' | 'check';
  linkedCashVoucherId?: string;
  description: string;
  balanceAfter: number;
  recordedBy: string;
}

export type RentalRateType = 'hourly' | 'daily' | 'monthly' | 'per_trip';
export type RentalMachineryType = 'excavator' | 'crane' | 'bobcat' | 'dump_truck' | 'water_tanker' | 'compactor' | 'passenger_car' | 'supervisor_pickup' | 'other';

export interface RentalMachinery {
  id: string;
  machineryNumber: string;
  machineryName: string;
  type: RentalMachineryType;
  typeAr: string;
  ownerVendorId?: string;
  ownerName: string;
  ownerPhone: string;
  plateOrSerialNumber: string;
  rentalRateType: RentalRateType;
  rateTypeAr?: string;
  unitRate: number;
  fuelCoveredBy: 'company' | 'owner';
  operatorProvided: boolean;
  operatorIncluded?: boolean;
  assignedProjectId: string;
  assignedProjectName: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'demobilized' | 'maintenance';
  totalUnitsWorked: number;
  totalAccruedCost: number;
  totalPaid: number;
  balanceDue: number;
  notes?: string;
}

export interface RentalWorkLog {
  id: string;
  logNumber: string;
  machineryId: string;
  machineryName: string;
  date: string;
  unitsWorked: number;
  unitRate: number;
  totalAmount: number;
  workDescription: string;
  siteSupervisor: string;
  projectId: string;
  projectName: string;
  notes?: string;
}

export interface RentalPayment {
  id: string;
  paymentNumber: string;
  machineryId: string;
  machineryName: string;
  ownerName: string;
  date: string;
  amount: number;
  paymentMethod: 'cash_safe' | 'bank_transfer' | 'check';
  linkedCashVoucherId?: string;
  referenceDocNumber?: string;
  notes?: string;
  recordedBy: string;
}

// -------------------------------------------------------------
// TASK 8: SYSTEM BACKUP & COMPREHENSIVE REPORTS TYPES
// -------------------------------------------------------------

export interface ErpBackupData {
  exportedAt: string;
  exportVersion: string;
  appTitle: string;
  companyName: string;
  licenseHash: string;
  data: {
    projects: Project[];
    invoices: Invoice[];
    cashVouchers: CashVoucher[];
    siteLogs: SiteOperationLog[];
    employees: Employee[];
    salarySlips: MonthlySalarySlip[];
    projectWorkers: ProjectWorker[];
    weeklyTimesheets: WeeklyLaborTimesheet[];
    procurements: DailyProcurementItem[];
    fuelLogs: FuelFleetLog[];
    officeExpenses: OfficeOverheadExpense[];
    vendors: SubcontractorVendor[];
    vendorTransactions: VendorTransaction[];
    rentalMachinery: RentalMachinery[];
    rentalWorkLogs: RentalWorkLog[];
    rentalPayments: RentalPayment[];
    auditLogs: AuditLog[];
  };
}
