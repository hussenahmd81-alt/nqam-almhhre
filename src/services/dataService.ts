import {
  UserRole,
  RoleConfig,
  UserProfile,
  Project,
  FinancialTransaction,
  SiteOperationLog,
  AuditLog,
  CashVoucher,
  DailySafeRegister,
  Invoice,
  Employee,
  MonthlySalarySlip,
  ProjectWorker,
  WeeklyLaborTimesheet,
  DailyProcurementItem,
  FuelFleetLog,
  OfficeOverheadExpense,
  SubcontractorVendor,
  VendorTransaction,
  RentalMachinery,
  RentalWorkLog,
  RentalPayment
} from '../types/erp';

export const ROLES_CONFIG: Record<string, RoleConfig> = {
  super_admin: {
    id: 'super_admin',
    nameAr: 'المدير العام (Super Admin)',
    nameEn: 'General Manager',
    titleAr: 'صادق جعفر - المدير العام والمؤسس (الإدارة العليا والقرارات الاستراتيجية)',
    descriptionAr: 'وصول كامل وشامل لجميع التقارير المالية السرية، الأرباح، التراخيص، وإدارة الصلاحيات وسجلات الأمان.',
    badgeColor: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    canViewFinancialReports: true,
    canViewConfidentialMargins: true,
    canCreateInvoice: true,
    canEditInvoice: true,
    canDeleteRecords: true,
    canApproveSubcontractorPayment: true,
    canLogDailySiteOperations: true,
    canManageLicense: true,
    canAccessAuditLogs: true,
    canExportData: true
  },
  accountant: {
    id: 'accountant',
    nameAr: 'المحاسب المالي (Accountant)',
    nameEn: 'Financial Accountant',
    titleAr: 'أ. حسام المالي - إدارة الحسابات والصندوق والمستخلصات',
    descriptionAr: 'إدخال ومراجعة الفواتير، حسابات المقاولين، الصندوق والعهد. محظور من حذف السجلات أو تعديل التراخيص أو كشف هوامش أرباح الشركة.',
    badgeColor: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    canViewFinancialReports: true,
    canViewConfidentialMargins: false,
    canCreateInvoice: true,
    canEditInvoice: true,
    canDeleteRecords: false,
    canApproveSubcontractorPayment: true,
    canLogDailySiteOperations: true,
    canManageLicense: false,
    canAccessAuditLogs: true,
    canExportData: true
  },
  data_entry: {
    id: 'data_entry',
    nameAr: 'مدخل بيانات / كادر الموقع (Data Entry)',
    nameEn: 'Site Data Entry / Field Staff',
    titleAr: 'م. سامي الميداني - الرصد الميداني وسجلات الآليات',
    descriptionAr: 'صلاحيات مقتصرة على تسجيل يوميات الموقع، استهلاك وقود المعدات والصرفيات الميدانية دون وصول للحسابات والتقارير العامة.',
    badgeColor: 'border-sky-500/50 bg-sky-500/10 text-sky-400',
    canViewFinancialReports: false,
    canViewConfidentialMargins: false,
    canCreateInvoice: false,
    canEditInvoice: false,
    canDeleteRecords: false,
    canApproveSubcontractorPayment: false,
    canLogDailySiteOperations: true,
    canManageLicense: false,
    canAccessAuditLogs: false,
    canExportData: false
  }
};

export const USER_PROFILES: Record<UserRole, UserProfile> = {
  super_admin: {
    id: 'USR-001',
    nameAr: 'صادق جعفر',
    role: 'super_admin',
    title: 'المدير العام والمؤسس',
    email: 'sadiq.jaafar@lamasat-almeamar.sa',
    phone: '+964 77 1234 5678',
    avatarLetter: 'ص',
    branch: 'المقر العام - بغداد'
  },
  accountant: {
    id: 'USR-002',
    nameAr: 'حسين احمد',
    role: 'accountant',
    title: 'مدير الحسابات والمالية',
    email: 'hussain.ahmed@lamasat-almeamar.sa',
    phone: '+964 78 1234 5678',
    avatarLetter: 'ح',
    branch: 'الإدارة المالية والمحاسبة'
  },
  data_entry: {
    id: 'USR-003',
    nameAr: 'مسؤول الموقع والبيانات',
    role: 'data_entry',
    title: 'مهندس الموقع ومسؤول تشغيل الآليات',
    email: 'site@lamasat-almeamar.sa',
    phone: '+964 75 1234 5678',
    avatarLetter: 'م',
    branch: 'موقع المشاريع'
  }
};

export const DEFAULT_ROLE_PINS: Record<UserRole, string> = {
  super_admin: '2026',
  accountant: '2222',
  data_entry: '3333'
};

export const COMPANY_BILLING_INFO = {
  nameAr: 'شركة لمسات المعمار للمقاولات والاستشارات الهندسية',
  nameEn: 'Lamasat Al-Meamar Contracting & Engineering Consultancy',
  commercialReg: '1010884920',
  vatNumber: '310294857200003',
  address: 'بغداد - المنصور - شارع 14 رمضان، جمهورية العراق',
  phone: '+964 77 1234 5678',
  mobile: '+964 78 1234 5678',
  email: 'finance@lamasat-almeamar.iq',
  website: 'www.lamasat-almeamar.iq',
  currency: 'د.ع',
  bankDetails: [
    { bankName: 'المصرف العراقي للتجارة (TBI)', iban: 'IQ98TRIQ0000000000123456789', swift: 'TRIQIQBA' },
    { bankName: 'مصرف بغداد', iban: 'IQ35BBOB0000000000987654321', swift: 'BBOBIQBA' }
  ]
};

export const CASH_IN_CATEGORIES = [
  { id: 'contract_payment', label: 'دفعة مقاولة مرحلية' },
  { id: 'client_settlement', label: 'تسديد مستحقات عميل' },
  { id: 'internal_financing', label: 'تمويل داخلي / تغذية بنكية' },
  { id: 'other_income', label: 'إيراد نقدي آخر' }
] as const;

export const CASH_OUT_CATEGORIES = [
  { id: 'subcontractor', label: 'دفعة مقاول باطن نقدية' },
  { id: 'materials', label: 'شراء مواد عاجلة وخردوات' },
  { id: 'petty_cash', label: 'عهدة موقع تشغيلية' },
  { id: 'fuel_maintenance', label: 'وقود وصيانة آليات' },
  { id: 'daily_wages', label: 'أجور عمالة يومية' },
  { id: 'utilities', label: 'رسوم حكومية وتصاريح' }
] as const;

// Clean, Zeroed-Out Operational & Financial Tables
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [];
export const INITIAL_SITE_LOGS: SiteOperationLog[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-09-23 12:00:00',
    userId: 'USR-001',
    userName: 'صادق جعفر',
    userRole: 'super_admin',
    action: 'تصفير وتهيئة النظام للتشغيل الفعلي النظيف',
    category: 'security',
    severity: 'info',
    ipAddress: '127.0.0.1 (الخادم المركزي)',
    details: 'تم تصفير كافة الأرقام والأسماء الوهمية، وتهيئة المنظومة لاستقبال البيانات التشغيلية الحقيقية.'
  }
];
export const INITIAL_CASH_VOUCHERS: CashVoucher[] = [];
export const INITIAL_SAFE_REGISTERS: DailySafeRegister[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_SALARY_SLIPS: MonthlySalarySlip[] = [];
export const INITIAL_PROJECT_WORKERS: ProjectWorker[] = [];
export const INITIAL_WEEKLY_TIMESHEETS: WeeklyLaborTimesheet[] = [];
export const INITIAL_DAILY_PROCUREMENTS: DailyProcurementItem[] = [];
export const INITIAL_FUEL_LOGS: FuelFleetLog[] = [];
export const INITIAL_OFFICE_EXPENSES: OfficeOverheadExpense[] = [];
export const INITIAL_VENDORS: SubcontractorVendor[] = [];
export const INITIAL_VENDOR_TRANSACTIONS: VendorTransaction[] = [];
export const INITIAL_RENTAL_MACHINERY: RentalMachinery[] = [];
export const INITIAL_RENTAL_WORK_LOGS: RentalWorkLog[] = [];
export const INITIAL_RENTAL_PAYMENTS: RentalPayment[] = [];
