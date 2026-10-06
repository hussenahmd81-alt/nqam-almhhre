import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef } from 'react';
import { ConvexHttpClient } from 'convex/browser';
import { readOfflineSnapshot, writeOfflineSnapshot, isPendingCollection } from '../services/offlineStorage';
import { makeFunctionReference } from 'convex/server';
import {
  UserRole,
  RoleConfig,
  UserProfile,
  LicenseInfo,
  AuditLog,
  Project,
  FinancialTransaction,
  SiteOperationLog,
  CashVoucher,
  DailySafeRegister,
  Invoice,
  InvoiceStatus,
  Employee,
  MonthlySalarySlip,
  ProjectWorker,
  WeeklyLaborTimesheet,
  WorkerWeekEntry,
  DailyProcurementItem,
  FuelFleetLog,
  OfficeOverheadExpense,
  SubcontractorVendor,
  VendorTransaction,
  RentalMachinery,
  RentalWorkLog,
  RentalPayment,
  ErpBackupData
} from '../types/erp';
import {
  ROLES_CONFIG,
  USER_PROFILES,
  INITIAL_PROJECTS,
  INITIAL_TRANSACTIONS,
  INITIAL_SITE_LOGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CASH_VOUCHERS,
  INITIAL_SAFE_REGISTERS,
  INITIAL_INVOICES,
  COMPANY_BILLING_INFO,
  INITIAL_EMPLOYEES,
  INITIAL_SALARY_SLIPS,
  INITIAL_PROJECT_WORKERS,
  INITIAL_WEEKLY_TIMESHEETS,
  INITIAL_DAILY_PROCUREMENTS,
  INITIAL_FUEL_LOGS,
  INITIAL_OFFICE_EXPENSES,
  INITIAL_VENDORS,
  INITIAL_VENDOR_TRANSACTIONS,
  INITIAL_RENTAL_MACHINERY,
  INITIAL_RENTAL_WORK_LOGS,
  INITIAL_RENTAL_PAYMENTS,
  DEFAULT_ROLE_PINS
} from '../services/dataService';
import { getStoredLicense, saveStoredLicense, verifyLicenseKey, DEFAULT_LICENSE } from '../services/licenseService';
import {
  roundMoney,
  nonNegative,
  calculateCashTotals,
  calculateInvoiceTotals,
  calculateInvoicePayment,
  calculateEmployeePackage,
  calculateMonthlySalary,
  calculateWeeklyWorkerPay,
  calculateWeeklyTotals,
  calculateQuantityTotal,
  calculateFuelMetrics,
  calculateLedgerBalance,
  generateZatcaQrData
} from '../utils/financialUtils';

interface ErpContextType {
  cloudSyncStatus: 'disabled' | 'loading' | 'saving' | 'synced' | 'error';
  isAuthenticated: boolean;
  loginWithPin: (role: UserRole, pin: string) => { success: boolean; message: string };
  logout: () => void;
  switchRoleWithPin: (targetRole: UserRole, pin: string) => { success: boolean; message: string };
  updateRolePin: (targetRole: UserRole, currentOrAdminPin: string, newPin: string) => { success: boolean; message: string };
  userProfiles: Record<UserRole, UserProfile>;
  activeUserRoles: UserRole[];
  updateUserProfile: (role: UserRole, nameAr: string, title?: string) => { success: boolean; message: string };
  deleteUserAccount: (role: UserRole) => { success: boolean; message: string };
  restoreUserAccount: (role: UserRole) => { success: boolean; message: string };
  currentRole: UserRole;
  roleConfig: RoleConfig;
  currentUser: UserProfile;
  setRole: (role: UserRole) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  license: LicenseInfo;
  verifyLicense: (key: string) => { isValid: boolean; status: string; message: string };
  resetDefaultLicense: () => void;
  auditLogs: AuditLog[];
  addAuditLog: (
    action: string,
    category: 'financial' | 'license' | 'operations' | 'security',
    severity: 'info' | 'warning' | 'critical',
    details: string,
    diff?: { field: string; oldVal: string; newVal: string }
  ) => void;
  projects: Project[];
  addProject: (p: Omit<Project, 'id'>) => boolean;
  deleteProject: (id: string) => boolean;
  transactions: FinancialTransaction[];
  siteLogs: SiteOperationLog[];
  addTransaction: (tx: Omit<FinancialTransaction, 'id' | 'createdBy'>) => boolean;
  deleteTransaction: (id: string) => boolean;
  approveTransaction: (id: string) => boolean;
  addSiteLog: (log: Omit<SiteOperationLog, 'id' | 'loggedBy'>) => boolean;
  
  // Task 3: Cash Flow & Safe Management
  cashVouchers: CashVoucher[];
  dailyRegisters: DailySafeRegister[];
  openingBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  liveSafeBalance: number;
  addCashVoucher: (voucher: Omit<CashVoucher, 'id' | 'voucherNumber' | 'time' | 'recordedBy'>) => boolean;
  deleteCashVoucher: (id: string) => boolean;
  closeDailyRegister: (actualPhysicalCount: number, notes: string) => { success: boolean; register?: DailySafeRegister };

  // Task 4: Smart Invoice & Billing Engine
  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdBy' | 'qrCodeData'>) => boolean;
  updateInvoiceStatus: (id: string, status: InvoiceStatus, paidAmount?: number) => boolean;
  deleteInvoice: (id: string) => boolean;
  selectedInvoiceForPrint: Invoice | null;
  setSelectedInvoiceForPrint: (invoice: Invoice | null) => void;
  companyBillingInfo: typeof COMPANY_BILLING_INFO;

  // Task 5: Payroll & Workforce Management
  employees: Employee[];
  salarySlips: MonthlySalarySlip[];
  projectWorkers: ProjectWorker[];
  weeklyTimesheets: WeeklyLaborTimesheet[];
  addEmployee: (emp: Omit<Employee, 'id' | 'code'>) => boolean;
  addSalarySlip: (slip: Omit<MonthlySalarySlip, 'id' | 'slipNumber'>) => boolean;
  approveAndDisburseSalary: (slipId: string) => boolean;
  addProjectWorker: (worker: Omit<ProjectWorker, 'id' | 'code'>) => boolean;
  updateWorkerAttendance: (
    timesheetId: string,
    workerId: string,
    day: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri',
    value: number
  ) => void;
  updateWorkerOvertimeAndAdvances: (
    timesheetId: string,
    workerId: string,
    overtimeHours: number,
    advances: number
  ) => void;
  approveAndDisburseWeeklyTimesheet: (timesheetId: string) => boolean;

  // Task 6: Operational Expenses, Logistics & Fleet
  procurements: DailyProcurementItem[];
  fuelLogs: FuelFleetLog[];
  officeExpenses: OfficeOverheadExpense[];
  addProcurementItem: (item: Omit<DailyProcurementItem, 'id' | 'purchaseNumber' | 'recordedBy'>) => boolean;
  addFuelLog: (log: Omit<FuelFleetLog, 'id' | 'logNumber' | 'distanceOrHours' | 'consumptionRate' | 'isAnomaly' | 'loggedBy'>) => boolean;
  addOfficeExpense: (exp: Omit<OfficeOverheadExpense, 'id' | 'expenseNumber' | 'recordedBy'>) => boolean;

  // Task 7: Subcontractors, Vendors & Rental Fleet
  vendors: SubcontractorVendor[];
  vendorTransactions: VendorTransaction[];
  addVendor: (vendor: Omit<SubcontractorVendor, 'id' | 'vendorNumber' | 'totalBilled' | 'totalPaid' | 'currentBalance'>) => boolean;
  addVendorBill: (vendorId: string, amount: number, description: string, referenceDocNumber: string, projectId?: string) => boolean;
  payVendor: (vendorId: string, amount: number, paymentMethod: 'cash_safe' | 'bank_transfer' | 'check', description: string, referenceDocNumber?: string) => boolean;

  rentalMachinery: RentalMachinery[];
  rentalWorkLogs: RentalWorkLog[];
  rentalPayments: RentalPayment[];
  addRentalMachinery: (machinery: Omit<RentalMachinery, 'id' | 'machineryNumber' | 'totalUnitsWorked' | 'totalAccruedCost' | 'totalPaid' | 'balanceDue'>) => boolean;
  logRentalWork: (machineryId: string, unitsWorked: number, workDescription: string, date: string, siteSupervisor: string) => boolean;
  payRentalMachinery: (machineryId: string, amount: number, paymentMethod: 'cash_safe' | 'bank_transfer' | 'check', notes?: string) => boolean;

  // Task 8: Backup, Analytics & Master Engine
  exportSystemBackup: () => ErpBackupData;
  downloadBackupFile: () => void;
  restoreSystemBackup: (jsonContent: string) => { success: boolean; message: string };
  resetToFactorySettings: () => void;

  hasPermission: (permissionKey: keyof RoleConfig) => boolean;
  notificationMessage: { title: string; message: string; type: 'success' | 'error' | 'warning' } | null;
  showNotification: (title: string, message: string, type?: 'success' | 'error' | 'warning') => void;
  closeNotification: () => void;
  isRoleModalOpen: boolean;
  setIsRoleModalOpen: (open: boolean) => void;
}

type CloudCollection = {
  collection: string;
  data: unknown;
  revision: number;
  updatedAt: number;
};

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL?.trim();
const CLOUD_WORKSPACE = 'lamasat-main';
const convexClient = CONVEX_URL ? new ConvexHttpClient(CONVEX_URL) : null;
const loadCloudCollections = makeFunctionReference<
  'query',
  { workspace: string },
  CloudCollection[]
>('erpState:loadAll');
const saveCloudCollection = makeFunctionReference<
  'mutation',
  {
    workspace: string;
    collection: string;
    data: unknown;
    expectedRevision?: number;
  },
  { revision: number; updatedAt: number }
>('erpState:saveCollection');

const ErpContext = createContext<ErpContextType | undefined>(undefined);

export const ErpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [offlineSnapshot] = useState(readOfflineSnapshot);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [syncAttempt, setSyncAttempt] = useState(0);
  const saveInProgressRef = useRef(false);
  const latestCollectionsRef = useRef<Record<string, unknown>>({});
  const hydratedRef = useRef(false);
  const baselineInitializedRef = useRef(false);
  const cached = <T,>(collection: string, fallback: T): T =>
    (offlineSnapshot && Object.hasOwn(offlineSnapshot.collections, collection))
      ? offlineSnapshot.collections[collection] as T : fallback;
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'disabled' | 'loading' | 'saving' | 'synced' | 'error'>(
    convexClient ? 'loading' : 'disabled'
  );
  const [cloudHydrated, setCloudHydrated] = useState(false);
  const cloudLoadStartedRef = useRef(false);
  const cloudRevisionsRef = useRef<Record<string, number>>(offlineSnapshot?.revisions ?? {});
  const cloudSerializedRef = useRef<Record<string, string>>(offlineSnapshot?.synced ?? {});
  // Stored PINs for roles (can be updated by Super Admin)
  const [userPins, setUserPins] = useState<Record<UserRole, string>>(() => {
    try {
      const stored = localStorage.getItem('lamasat_user_pins');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_ROLE_PINS;
  });

  // Stored Profiles / Names for roles (can be updated by Super Admin)
  const [userProfiles, setUserProfiles] = useState<Record<UserRole, UserProfile>>(() => {
    if (offlineSnapshot?.collections.userProfiles) return cached('userProfiles', USER_PROFILES);
    try {
      const stored = localStorage.getItem('lamasat_user_profiles');
      if (stored) return JSON.parse(stored);
    } catch {}
    return USER_PROFILES;
  });

  const [activeUserRoles, setActiveUserRoles] = useState<UserRole[]>(() => {
    if (offlineSnapshot?.collections.activeUserRoles) return cached('activeUserRoles', ['super_admin', 'accountant', 'data_entry'] as UserRole[]);
    try {
      const stored = localStorage.getItem('lamasat_active_user_roles');
      if (stored) {
        const parsed = JSON.parse(stored) as UserRole[];
        const validRoles = parsed.filter((role) => role in USER_PROFILES);
        if (validRoles.includes('super_admin')) return validRoles;
      }
    } catch {}
    return ['super_admin', 'accountant', 'data_entry'];
  });

  // Current authenticated user role - stored per-device session
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      const session = sessionStorage.getItem('lamasat_auth_user');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.role) return parsed.role;
      }
    } catch {}
    return 'super_admin';
  });

  // Whether the current device session is actively logged in
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const session = sessionStorage.getItem('lamasat_auth_user');
      if (session) {
        const parsed = JSON.parse(session);
        return Boolean(parsed.isAuthenticated);
      }
    } catch {}
    return false; // Show luxury Login Screen on first open
  });
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [license, setLicense] = useState<LicenseInfo>(getStoredLicense());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => cached('auditLogs', INITIAL_AUDIT_LOGS));
  const [projects, setProjects] = useState<Project[]>(() => cached('projects', INITIAL_PROJECTS));
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => cached('transactions', INITIAL_TRANSACTIONS));
  const [siteLogs, setSiteLogs] = useState<SiteOperationLog[]>(() => cached('siteLogs', INITIAL_SITE_LOGS));
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  // Task 3: Cash & Safe State
  const [cashVouchers, setCashVouchers] = useState<CashVoucher[]>(() => cached('cashVouchers', INITIAL_CASH_VOUCHERS));
  const [dailyRegisters, setDailyRegisters] = useState<DailySafeRegister[]>(() => cached('dailyRegisters', INITIAL_SAFE_REGISTERS));
  const [openingBalance, setOpeningBalance] = useState<number>(() => cached('openingBalance', 0));

  // Task 4: Invoices State
  const [invoices, setInvoices] = useState<Invoice[]>(() => cached('invoices', INITIAL_INVOICES));
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Task 5: Payroll & Workforce State
  const [employees, setEmployees] = useState<Employee[]>(() => cached('employees', INITIAL_EMPLOYEES));
  const [salarySlips, setSalarySlips] = useState<MonthlySalarySlip[]>(() => cached('salarySlips', INITIAL_SALARY_SLIPS));
  const [projectWorkers, setProjectWorkers] = useState<ProjectWorker[]>(() => cached('projectWorkers', INITIAL_PROJECT_WORKERS));
  const [weeklyTimesheets, setWeeklyTimesheets] = useState<WeeklyLaborTimesheet[]>(() => cached('weeklyTimesheets', INITIAL_WEEKLY_TIMESHEETS));

  // Task 6: Operational Logistics & Expenses State
  const [procurements, setProcurements] = useState<DailyProcurementItem[]>(() => cached('procurements', INITIAL_DAILY_PROCUREMENTS));
  const [fuelLogs, setFuelLogs] = useState<FuelFleetLog[]>(() => cached('fuelLogs', INITIAL_FUEL_LOGS));
  const [officeExpenses, setOfficeExpenses] = useState<OfficeOverheadExpense[]>(() => cached('officeExpenses', INITIAL_OFFICE_EXPENSES));

  // Task 7: Subcontractors, Vendors & Rental Fleet State
  const [vendors, setVendors] = useState<SubcontractorVendor[]>(() => cached('vendors', INITIAL_VENDORS));
  const [vendorTransactions, setVendorTransactions] = useState<VendorTransaction[]>(() => cached('vendorTransactions', INITIAL_VENDOR_TRANSACTIONS));
  const [rentalMachinery, setRentalMachinery] = useState<RentalMachinery[]>(() => cached('rentalMachinery', INITIAL_RENTAL_MACHINERY));
  const [rentalWorkLogs, setRentalWorkLogs] = useState<RentalWorkLog[]>(() => cached('rentalWorkLogs', INITIAL_RENTAL_WORK_LOGS));
  const [rentalPayments, setRentalPayments] = useState<RentalPayment[]>(() => cached('rentalPayments', INITIAL_RENTAL_PAYMENTS));

  const cloudCollections = useMemo<Record<string, unknown>>(
    () => ({
      projects,
      transactions,
      siteLogs,
      cashVouchers,
      dailyRegisters,
      openingBalance,
      invoices,
      employees,
      salarySlips,
      projectWorkers,
      weeklyTimesheets,
      procurements,
      fuelLogs,
      officeExpenses,
      vendors,
      vendorTransactions,
      rentalMachinery,
      rentalWorkLogs,
      rentalPayments,
      auditLogs,
      userProfiles,
      activeUserRoles
    }),
    [
      projects,
      transactions,
      siteLogs,
      cashVouchers,
      dailyRegisters,
      openingBalance,
      invoices,
      employees,
      salarySlips,
      projectWorkers,
      weeklyTimesheets,
      procurements,
      fuelLogs,
      officeExpenses,
      vendors,
      vendorTransactions,
      rentalMachinery,
      rentalWorkLogs,
      rentalPayments,
      auditLogs,
      userProfiles,
      activeUserRoles
    ]
  );

  useEffect(() => {
    const online = () => { setIsOnline(true); setSyncAttempt((value) => value + 1); };
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  latestCollectionsRef.current = cloudCollections;
  if (!baselineInitializedRef.current) {
    baselineInitializedRef.current = true;
    if (!offlineSnapshot) {
      cloudSerializedRef.current = Object.fromEntries(
        Object.entries(cloudCollections).map(([key, data]) => [key, JSON.stringify(data)])
      );
    }
  }

  const persistOffline = () => {
    try {
      writeOfflineSnapshot({
        collections: latestCollectionsRef.current,
        revisions: cloudRevisionsRef.current,
        synced: cloudSerializedRef.current,
      });
      return true;
    } catch {
      setNotificationMessage({ title: 'تعذر الحفظ على الجهاز', message: 'مساحة تخزين المتصفح غير متاحة. احفظ نسخة احتياطية قبل إغلاق النظام.', type: 'error' });
      return false;
    }
  };

  useEffect(() => {
    persistOffline();
  }, [cloudCollections, cloudHydrated]);

  useEffect(() => {
    if (!convexClient || !isOnline || cloudLoadStartedRef.current || hydratedRef.current) return;
    cloudLoadStartedRef.current = true;
    setCloudSyncStatus('loading');

    convexClient
      .query(loadCloudCollections, { workspace: CLOUD_WORKSPACE })
      .then((rows) => {
        for (const row of rows) {
          const localSnapshot = {
            collections: latestCollectionsRef.current,
            revisions: cloudRevisionsRef.current,
            synced: cloudSerializedRef.current,
          };
          if (isPendingCollection(localSnapshot, row.collection)) continue;
          cloudRevisionsRef.current[row.collection] = row.revision;
          cloudSerializedRef.current[row.collection] = JSON.stringify(row.data);

          switch (row.collection) {
            case 'projects': setProjects(row.data as Project[]); break;
            case 'transactions': setTransactions(row.data as FinancialTransaction[]); break;
            case 'siteLogs': setSiteLogs(row.data as SiteOperationLog[]); break;
            case 'cashVouchers': setCashVouchers(row.data as CashVoucher[]); break;
            case 'dailyRegisters': setDailyRegisters(row.data as DailySafeRegister[]); break;
            case 'openingBalance': setOpeningBalance(nonNegative(row.data as number)); break;
            case 'invoices': setInvoices(row.data as Invoice[]); break;
            case 'employees': setEmployees(row.data as Employee[]); break;
            case 'salarySlips': setSalarySlips(row.data as MonthlySalarySlip[]); break;
            case 'projectWorkers': setProjectWorkers(row.data as ProjectWorker[]); break;
            case 'weeklyTimesheets': setWeeklyTimesheets(row.data as WeeklyLaborTimesheet[]); break;
            case 'procurements': setProcurements(row.data as DailyProcurementItem[]); break;
            case 'fuelLogs': setFuelLogs(row.data as FuelFleetLog[]); break;
            case 'officeExpenses': setOfficeExpenses(row.data as OfficeOverheadExpense[]); break;
            case 'vendors': setVendors(row.data as SubcontractorVendor[]); break;
            case 'vendorTransactions': setVendorTransactions(row.data as VendorTransaction[]); break;
            case 'rentalMachinery': setRentalMachinery(row.data as RentalMachinery[]); break;
            case 'rentalWorkLogs': setRentalWorkLogs(row.data as RentalWorkLog[]); break;
            case 'rentalPayments': setRentalPayments(row.data as RentalPayment[]); break;
            case 'auditLogs': setAuditLogs(row.data as AuditLog[]); break;
            case 'userProfiles': setUserProfiles(row.data as Record<UserRole, UserProfile>); break;
            case 'activeUserRoles': setActiveUserRoles(row.data as UserRole[]); break;
          }
        }
        hydratedRef.current = true;
        setCloudHydrated(true);
        setCloudSyncStatus('synced');
      })
      .catch(() => {
        cloudLoadStartedRef.current = false;
        setCloudSyncStatus('error');
      });
  }, [isOnline, syncAttempt]);

  useEffect(() => {
    if (!convexClient || !cloudHydrated || !isOnline || saveInProgressRef.current) return;

    const pending = Object.entries(cloudCollections)
      .map(([collection, data]) => ({ collection, data, serialized: JSON.stringify(data) }))
      .filter(({ collection, serialized }) => cloudSerializedRef.current[collection] !== serialized);

    if (pending.length === 0) {
      setCloudSyncStatus('synced');
      return;
    }

    const timer = window.setTimeout(async () => {
      saveInProgressRef.current = true;
      setCloudSyncStatus('saving');
      let failed = false;
      try {
        for (const item of pending) {
          const result = await convexClient.mutation(saveCloudCollection, {
            workspace: CLOUD_WORKSPACE,
            collection: item.collection,
            data: item.data,
            expectedRevision: cloudRevisionsRef.current[item.collection] ?? 0
          });
          cloudRevisionsRef.current[item.collection] = result.revision;
          cloudSerializedRef.current[item.collection] = item.serialized;
          persistOffline();
        }
        setCloudSyncStatus('synced');
      } catch (error) {
        failed = true;
        setCloudSyncStatus('error');
        if (String(error).includes('REVISION_CONFLICT')) {
          setNotificationMessage({ title: 'تعارض في المزامنة', message: 'تغيرت بيانات السحابة من جهاز آخر. تعديلاتك محفوظة على هذا الجهاز؛ صدّر نسخة احتياطية لمراجعة التعارض قبل المزامنة.', type: 'error' });
        }
      } finally {
        saveInProgressRef.current = false;
        persistOffline();
        if (!failed) setSyncAttempt((value) => value + 1);
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [cloudCollections, cloudHydrated, isOnline, syncAttempt]);

  // Sync stored license
  useEffect(() => {
    saveStoredLicense(license);
  }, [license]);

  const currentUser = userProfiles[currentRole] || USER_PROFILES[currentRole];
  const roleConfig = ROLES_CONFIG[currentRole];

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotificationMessage({ title, message, type });
    setTimeout(() => {
      setNotificationMessage((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const closeNotification = () => {
    setNotificationMessage(null);
  };

  const addAuditLog = (
    action: string,
    category: 'financial' | 'license' | 'operations' | 'security',
    severity: 'info' | 'warning' | 'critical',
    details: string,
    diff?: { field: string; oldVal: string; newVal: string }
  ) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser.id,
      userName: currentUser.nameAr,
      userRole: currentRole,
      action,
      category,
      severity,
      ipAddress: 'جلسة محلية - بانتظار ربط قاعدة البيانات',
      details,
      diff
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const hasPermission = (permissionKey: keyof RoleConfig): boolean => {
    const val = roleConfig[permissionKey];
    return typeof val === 'boolean' ? val : false;
  };

  const loginWithPin = (role: UserRole, pin: string): { success: boolean; message: string } => {
    if (!activeUserRoles.includes(role)) {
      return { success: false, message: 'هذا الحساب محذوف أو غير نشط.' };
    }
    const expectedPin = userPins[role];
    const roleProfile = userProfiles[role] || USER_PROFILES[role];
    if (pin.trim() === expectedPin) {
      setCurrentRoleState(role);
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(
          'lamasat_auth_user',
          JSON.stringify({ role, isAuthenticated: true, loggedAt: new Date().toISOString() })
        );
      } catch {}
      addAuditLog(
        'تسجيل دخول ناجح ومصادقة المستخدم',
        'security',
        'info',
        `تم تسجيل الدخول بنجاح لحساب [${roleProfile.nameAr}] بصفة [${ROLES_CONFIG[role].nameAr}].`
      );
      showNotification('تم تسجيل الدخول بنجاح', `مرحباً بك: ${roleProfile.nameAr}`);
      return { success: true, message: 'تم التحقق بنجاح.' };
    } else {
      addAuditLog(
        'محاولة دخول فاشلة برمز PIN خاطئ',
        'security',
        'warning',
        `محاولة دخول غير مصرح بها لحساب [${roleProfile.nameAr}] برمز خاطئ دون حفظ قيمة الرمز.`
      );
      showNotification('فشل تسجيل الدخول', 'الرمز السري (PIN) المدخل غير صحيح! تم تقييد الدخول.', 'error');
      return { success: false, message: 'الرمز السري (PIN) غير صحيح.' };
    }
  };

  const switchRoleWithPin = (targetRole: UserRole, pin: string): { success: boolean; message: string } => {
    if (!activeUserRoles.includes(targetRole)) {
      return { success: false, message: 'هذا الحساب محذوف أو غير نشط.' };
    }
    if (targetRole === currentRole) {
      return { success: true, message: 'أنت بهذا الدور حالياً.' };
    }

    const expectedPin = userPins[targetRole];
    const targetProfile = userProfiles[targetRole] || USER_PROFILES[targetRole];
    if (pin.trim() === expectedPin) {
      const oldRoleName = ROLES_CONFIG[currentRole].nameAr;
      const newRoleName = ROLES_CONFIG[targetRole].nameAr;
      setCurrentRoleState(targetRole);
      try {
        sessionStorage.setItem(
          'lamasat_auth_user',
          JSON.stringify({ role: targetRole, isAuthenticated: true, loggedAt: new Date().toISOString() })
        );
      } catch {}
      addAuditLog(
        'تبديل حساب معتمد برمز PIN',
        'security',
        'info',
        `تم الانتقال من [${oldRoleName}] إلى [${newRoleName}] بواسطة [${targetProfile.nameAr}].`
      );
      showNotification('تم تبديل الحساب', `تم الانتقال بنجاح إلى حساب ${targetProfile.nameAr}`);
      return { success: true, message: 'تم تفعيل الدور بنجاح.' };
    } else {
      addAuditLog(
        'محاولة اختراق أو تبديل دور غير مصرح',
        'security',
        'critical',
        `محاولة غير مصرح بها للتبديل من [${ROLES_CONFIG[currentRole].nameAr}] إلى [${ROLES_CONFIG[targetRole].nameAr}] برمز PIN خاطئ!`
      );
      showNotification('رفض الوصول', 'الرمز السري غير صحيح! لا يمكن استبدال الحساب دون معرفة رمزه السري.', 'error');
      return { success: false, message: 'الرمز السري (PIN) غير صحيح! تم تسجيل المحاولة أمنياً.' };
    }
  };

  const logout = () => {
    addAuditLog(
      'تسجيل خروج وقفل النظام',
      'security',
      'info',
      `تم قفل النظام وتسجيل الخروج بواسطة [${currentUser.nameAr}].`
    );
    try {
      sessionStorage.removeItem('lamasat_auth_user');
    } catch {}
    setIsAuthenticated(false);
    showNotification('تم قفل النظام', 'تم تسجيل الخروج بنجاح.');
  };

  const updateRolePin = (
    targetRole: UserRole,
    currentOrAdminPin: string,
    newPin: string
  ): { success: boolean; message: string } => {
    const isAdmin = currentRole === 'super_admin';
    const isOwner = userPins[targetRole] === currentOrAdminPin;

    if (!isAdmin && targetRole !== currentRole) {
      return { success: false, message: 'يمكنك تعديل كلمة سر حسابك فقط.' };
    }

    if (!isAdmin && !isOwner) {
      return { success: false, message: 'ليس لديك صلاحية لتعديل هذا الرمز، أو الرمز الحالي غير صحيح.' };
    }

    if (newPin.trim().length < 4) {
      return { success: false, message: 'يجب ألا يقل الرمز السري الجديد عن 4 خانات.' };
    }

    const updated = { ...userPins, [targetRole]: newPin.trim() };
    setUserPins(updated);
    try {
      localStorage.setItem('lamasat_user_pins', JSON.stringify(updated));
    } catch {}

    addAuditLog(
      'تحديث الرمز السري (PIN)',
      'security',
      'warning',
      `تم تغيير الرمز السري لحساب [${ROLES_CONFIG[targetRole].nameAr}] بواسطة [${currentUser.nameAr}].`
    );
    showNotification('تم تحديث الرمز', `تم حفظ الرمز السري الجديد لحساب ${ROLES_CONFIG[targetRole].nameAr}`);
    return { success: true, message: 'تم تحديث الرمز السري بنجاح.' };
  };

  const updateUserProfile = (
    role: UserRole,
    nameAr: string,
    title?: string
  ): { success: boolean; message: string } => {
    if (currentRole !== 'super_admin' && role !== currentRole) {
      return { success: false, message: 'يمكنك تعديل بيانات حسابك فقط.' };
    }

    if (!activeUserRoles.includes(role)) {
      return { success: false, message: 'الحساب محذوف. أعد تفعيله أولاً.' };
    }

    if (!nameAr.trim()) {
      return { success: false, message: 'لا يمكن ترك الاسم فارغاً.' };
    }

    const trimmedName = nameAr.trim();
    const letter = trimmedName.charAt(0);
    const updated = {
      ...userProfiles,
      [role]: {
        ...userProfiles[role],
        nameAr: trimmedName,
        title: title?.trim() || userProfiles[role].title,
        avatarLetter: letter
      }
    };

    setUserProfiles(updated);
    try {
      localStorage.setItem('lamasat_user_profiles', JSON.stringify(updated));
    } catch {}

    addAuditLog(
      'تحديث بيانات المستخدم والاسم',
      'security',
      'warning',
      `قام المدير العام بتحديث اسم حساب [${ROLES_CONFIG[role].nameAr}] إلى: [${trimmedName}].`
    );
    showNotification('تم تحديث الاسم', `تم حفظ الاسم الجديد: ${trimmedName}`);
    return { success: true, message: 'تم تحديث الاسم بنجاح.' };
  };

  const saveActiveRoles = (roles: UserRole[]) => {
    setActiveUserRoles(roles);
    try {
      localStorage.setItem('lamasat_active_user_roles', JSON.stringify(roles));
    } catch {}
  };

  const deleteUserAccount = (role: UserRole): { success: boolean; message: string } => {
    if (role === 'super_admin') {
      return { success: false, message: 'لا يمكن حذف حساب المدير العام لأنه حساب الاسترداد والإدارة الوحيد.' };
    }
    if (currentRole !== 'super_admin' && currentRole !== role) {
      return { success: false, message: 'لا تملك صلاحية حذف هذا الحساب.' };
    }
    if (!activeUserRoles.includes(role)) {
      return { success: false, message: 'الحساب محذوف بالفعل.' };
    }

    const targetName = userProfiles[role].nameAr;
    const nextRoles = activeUserRoles.filter((activeRole) => activeRole !== role);
    addAuditLog(
      'حذف حساب مستخدم من بوابة الدخول',
      'security',
      'critical',
      `تم حذف حساب [${targetName}] وتعطيل دخوله بواسطة [${currentUser.nameAr}].`
    );
    saveActiveRoles(nextRoles);

    if (currentRole === role) {
      try {
        sessionStorage.removeItem('lamasat_auth_user');
      } catch {}
      setIsAuthenticated(false);
    }

    showNotification('تم حذف الحساب', `تم حذف حساب ${targetName} من شاشة الدخول.`, 'warning');
    return { success: true, message: 'تم حذف الحساب بنجاح.' };
  };

  const restoreUserAccount = (role: UserRole): { success: boolean; message: string } => {
    if (currentRole !== 'super_admin') {
      return { success: false, message: 'إعادة تفعيل الحسابات متاحة للمدير العام فقط.' };
    }
    if (activeUserRoles.includes(role)) {
      return { success: false, message: 'الحساب نشط بالفعل.' };
    }
    saveActiveRoles([...activeUserRoles, role]);
    addAuditLog(
      'إعادة تفعيل حساب مستخدم',
      'security',
      'warning',
      `تمت إعادة تفعيل حساب [${userProfiles[role].nameAr}] بواسطة [${currentUser.nameAr}].`
    );
    showNotification('تمت إعادة التفعيل', `عاد حساب ${userProfiles[role].nameAr} إلى شاشة الدخول.`);
    return { success: true, message: 'تمت إعادة تفعيل الحساب.' };
  };

  const setRole = (newRole: UserRole) => {
    const oldRoleName = ROLES_CONFIG[currentRole].nameAr;
    const newRoleName = ROLES_CONFIG[newRole].nameAr;
    setCurrentRoleState(newRole);
    
    addAuditLog(
      'تبديل دور المستخدم النشط',
      'security',
      'info',
      `تم التحويل من [${oldRoleName}] إلى [${newRoleName}].`
    );
    showNotification(
      'تم تغيير الدور بنجاح',
      `أنت تتصفح النظام الآن بصفة: ${newRoleName}`,
      'success'
    );
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const verifyLicense = (key: string) => {
    if (!hasPermission('canManageLicense')) {
      addAuditLog(
        'محاولة مرفوضة: تعديل ترخيص النظام بدون صلاحية',
        'security',
        'critical',
        `حاول المستخدم [${currentUser.nameAr}] بدور [${roleConfig.nameAr}] تعديل رمز الترخيص دون إذن.`
      );
      showNotification('عملية محظورة', 'ليس لديك صلاحية إدارة وتعديل تراخيص النظام (خاص بالمدير العام).', 'error');
      return { isValid: false, status: 'forbidden', message: 'ليس لديك صلاحية إدارة التراخيص.' };
    }

    const res = verifyLicenseKey(key);
    const updatedLicense: LicenseInfo = {
      ...license,
      licenseKey: key,
      status: res.status,
      lastVerificationTime: new Date().toISOString(),
      ...(res.licenseData || {})
    };

    setLicense(updatedLicense);

    addAuditLog(
      'فحص والتحقق من مفتاح ترخيص النظام',
      'license',
      res.isValid ? 'info' : 'warning',
      `نتيجة فحص المفتاح [${key}]: ${res.message}`
    );

    showNotification(
      res.isValid ? 'ترخيص معتمد' : 'تنبيه أمني في الترخيص',
      res.message,
      res.isValid ? 'success' : 'error'
    );

    return res;
  };

  const resetDefaultLicense = () => {
    setLicense(DEFAULT_LICENSE);
    addAuditLog(
      'استعادة الترخيص الرسمي لشركة لمسات المعمار',
      'license',
      'info',
      'تمت استعادة الترخيص المؤسسي الافتراضي المعتمد.'
    );
    showNotification('تمت الاستعادة', 'تمت استعادة الترخيص الرسمي المعتمد لشركة لمسات المعمار.', 'success');
  };

  const addProject = (projectData: Omit<Project, 'id'>): boolean => {
    const newProject: Project = {
      ...projectData,
      id: `PRJ-${Date.now().toString().slice(-4)}`
    };
    setProjects((prev) => [newProject, ...prev]);
    addAuditLog(
      'إضافة مشروع هندسي جديد',
      'operations',
      'info',
      `تم تسجيل مشروع جديد [${newProject.nameAr}] بقيمة ${newProject.totalBudget.toLocaleString()} د.ع`
    );
    showNotification('تمت إضافة المشروع', `تم إنشاء ملف المشروع ${newProject.nameAr} بنجاح.`);
    return true;
  };

  const deleteProject = (id: string): boolean => {
    if (!hasPermission('canDeleteRecords')) {
      showNotification('غير مصرح', 'ليس لديك صلاحية حذف سجلات المشاريع.', 'error');
      return false;
    }
    const target = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    addAuditLog(
      'حذف مشروع هندسي',
      'operations',
      'warning',
      `تم حذف المشروع [${target?.nameAr || id}] بواسطة [${currentUser.nameAr}]`
    );
    showNotification('تم حذف المشروع', 'تمت إزالة سجل المشروع بنجاح.');
    return true;
  };

  const addTransaction = (tx: Omit<FinancialTransaction, 'id' | 'createdBy'>): boolean => {
    if (!hasPermission('canCreateInvoice')) {
      addAuditLog(
        'محاولة إضافة معاملة مالية محظورة',
        'security',
        'warning',
        `تم حظر المستخدم [${currentUser.nameAr}] من إضافة فاتورة لعدم وجود الصلاحية.`
      );
      showNotification('غير مصرح', 'لا تملك صلاحية إنشاء فواتير أو مستخلصات مالية.', 'error');
      return false;
    }
    if (!tx.projectId || !tx.recipientName.trim() || nonNegative(tx.amount) <= 0) {
      showNotification('بيانات المعاملة ناقصة', 'اختر مشروعًا وأدخل اسم المستفيد ومبلغًا أكبر من صفر.', 'error');
      return false;
    }

    const newTx: FinancialTransaction = {
      ...tx,
      amount: nonNegative(tx.amount),
      vatAmount: nonNegative(tx.vatAmount),
      id: `TX-${Date.now().toString().slice(-4)}`,
      createdBy: currentUser.nameAr
    };

    setTransactions((prev) => [newTx, ...prev]);
    addAuditLog(
      `تسجيل معاملة مالية جديدة (${tx.invoiceNumber})`,
      'financial',
      'info',
      `تم إدخال ${tx.category === 'subcontractor' ? 'مستخلص مقاول' : 'فاتورة'} بمبلغ ${tx.amount.toLocaleString()} د.ع لصالح [${tx.recipientName}] لمشروع [${tx.projectName}].`
    );
    showNotification('تمت العملية', `تم تسجيل السند المالي رقم ${tx.invoiceNumber} بنجاح.`, 'success');
    return true;
  };

  const approveTransaction = (id: string): boolean => {
    if (!hasPermission('canApproveSubcontractorPayment')) {
      showNotification('مرفوض', 'ليس لديك صلاحية اعتماد المستخلصات المالية.', 'error');
      return false;
    }

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          addAuditLog(
            `اعتماد المستخلص المالي (${t.invoiceNumber})`,
            'financial',
            'info',
            `تم اعتماد صرف مبلغ ${t.amount.toLocaleString()} د.ع بواسطة [${currentUser.nameAr}].`
          );
          return { ...t, status: 'approved', approvedBy: currentUser.nameAr };
        }
        return t;
      })
    );

    showNotification('تم الاعتماد', 'تم اعتماد المستخلص المالي وتوجيهه للصرف البنكي.', 'success');
    return true;
  };

  const deleteTransaction = (id: string): boolean => {
    if (!hasPermission('canDeleteRecords')) {
      addAuditLog(
        'منع أمني: محاولة حذف معاملة مالية بدون صلاحية المدير العام',
        'security',
        'warning',
        `حاول [${currentUser.nameAr}] حذف السند (${id}) ولكن النظام أوقف العملية وفق سياسة منع التلاعب المالي.`
      );
      showNotification('محظور أمنياً', 'وفق سياسة الأمان، حذف السجلات المالية مقتصر حصراً على المدير العام لمنع التلاعب.', 'error');
      return false;
    }

    const target = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    
    addAuditLog(
      `حذف سجل مالي نهائي (${target?.invoiceNumber || id})`,
      'financial',
      'critical',
      `قام المدير العام [${currentUser.nameAr}] بحذف المستخلص رقم ${target?.invoiceNumber} بقيمة ${target?.amount.toLocaleString()} د.ع.`
    );
    showNotification('تم الحذف', 'تم حذف السجل المالي وسجلت العملية في سجل التدقيق الأمني.', 'warning');
    return true;
  };

  const addSiteLog = (log: Omit<SiteOperationLog, 'id' | 'loggedBy'>): boolean => {
    if (!hasPermission('canLogDailySiteOperations')) {
      showNotification('غير مصرح', 'ليس لديك صلاحية تسجيل يوميات الموقع.', 'error');
      return false;
    }

    const newLog: SiteOperationLog = {
      ...log,
      id: `LOG-${Date.now().toString().slice(-4)}`,
      loggedBy: currentUser.nameAr
    };

    setSiteLogs((prev) => [newLog, ...prev]);
    addAuditLog(
      `تسجيل تقرير موقع يومي (${log.machineryId})`,
      'operations',
      'info',
      `تم رصد استهلاك ${log.fuelLiters} لتر وقود للآلية [${log.equipmentType}] وعدد ${log.workersCount} عامل.`
    );
    showNotification('تم الحفظ', 'تم قيد التقرير الميداني واستهلاك الوقود بنجاح.', 'success');
    return true;
  };

  // --- Task 3: Cash Flow & Safe Management Computations & Actions ---
  const { totalCashIn, totalCashOut, liveSafeBalance } = useMemo(() => {
    return calculateCashTotals(openingBalance, cashVouchers);
  }, [cashVouchers, openingBalance]);

  const addCashVoucher = (voucher: Omit<CashVoucher, 'id' | 'voucherNumber' | 'time' | 'recordedBy'>): boolean => {
    if (!hasPermission('canCreateInvoice') && !hasPermission('canApproveSubcontractorPayment')) {
      showNotification('غير مصرح', 'ليس لديك صلاحية قيد سندات الصندوق والخزينة.', 'error');
      return false;
    }

    const amount = nonNegative(voucher.amount);
    if (amount <= 0) {
      showNotification('قيمة غير صحيحة', 'يجب أن يكون مبلغ السند أكبر من صفر.', 'error');
      return false;
    }
    if (voucher.type === 'cash_out' && voucher.paymentMethod === 'cash' && amount > liveSafeBalance) {
      showNotification('رصيد الصندوق غير كافٍ', `الرصيد النقدي المتاح هو ${liveSafeBalance.toLocaleString()} د.ع.`, 'error');
      return false;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const seq = Math.floor(1000 + Math.random() * 9000);
    const prefix = voucher.type === 'cash_in' ? 'RV' : 'PV';
    const voucherNumber = `${prefix}-LM-2026-${seq}`;

    const newVoucher: CashVoucher = {
      ...voucher,
      amount,
      id: `VCH-${voucher.type === 'cash_in' ? 'IN' : 'OUT'}-${Date.now().toString().slice(-4)}`,
      voucherNumber,
      time: timeStr,
      recordedBy: currentUser.nameAr,
      approvedBy: currentRole === 'super_admin' ? currentUser.nameAr : undefined
    };

    setCashVouchers((prev) => [newVoucher, ...prev]);

    const typeLabel = voucher.type === 'cash_in' ? 'سند قبض / وارد' : 'سند صرف / صادر';
    addAuditLog(
      `قيد ${typeLabel} (${voucherNumber})`,
      'financial',
      'info',
      `تم تسجيل ${typeLabel} بمبلغ ${voucher.amount.toLocaleString()} د.ع لصالح [${voucher.partyName}] - التصنيف: [${voucher.categoryLabelAr}].`
    );

    showNotification('تم قيد السند', `تم إصدار السند المالي ${voucherNumber} بنجاح وقيده بالخزينة.`, 'success');
    return true;
  };

  const deleteCashVoucher = (id: string): boolean => {
    if (!hasPermission('canDeleteRecords')) {
      addAuditLog(
        'منع أمني: محاولة إلغاء سند صندوق بدون صلاحية المدير العام',
        'security',
        'warning',
        `حاول [${currentUser.nameAr}] إلغاء السند (${id}) ولكن النظام تصدى للمحاولة.`
      );
      showNotification('محظور أمنياً', 'إلغاء أو حذف سندات الصندوق مقتصر حصراً على المدير العام لمنع التلاعب المالي.', 'error');
      return false;
    }

    const target = cashVouchers.find((v) => v.id === id);
    setCashVouchers((prev) => prev.filter((v) => v.id !== id));

    addAuditLog(
      `حذف سند خزينة دائم (${target?.voucherNumber || id})`,
      'financial',
      'critical',
      `قام المدير العام [${currentUser.nameAr}] بحذف ${target?.type === 'cash_in' ? 'سند قبض' : 'سند صرف'} رقم ${target?.voucherNumber} بقيمة ${target?.amount.toLocaleString()} د.ع.`
    );

    showNotification('تم الحذف', 'تم حذف سند الصندوق وتوثيقه في سجل التدقيق المالي المشفر.', 'warning');
    return true;
  };

  const closeDailyRegister = (actualPhysicalCount: number, notes: string) => {
    const diff = roundMoney(actualPhysicalCount - liveSafeBalance);
    const status: 'balanced' | 'shortage' | 'surplus' =
      diff === 0 ? 'balanced' : diff > 0 ? 'surplus' : 'shortage';

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimestamp = `${todayStr} ${new Date().toTimeString().split(' ')[0]}`;

    const newRegister: DailySafeRegister = {
      id: `REG-${todayStr}-${Date.now().toString().slice(-4)}`,
      date: todayStr,
      openingBalance,
      totalCashIn,
      totalCashOut,
      expectedSystemBalance: liveSafeBalance,
      actualPhysicalCount: roundMoney(actualPhysicalCount),
      difference: diff,
      status,
      closedAt: nowTimestamp,
      closedBy: currentUser.nameAr,
      notes: notes || (diff === 0 ? 'تم الجرد الفعلي والتطابق 100% مع الرصيد الدفتري.' : `فارق جرد: ${diff > 0 ? 'فائض' : 'عجز'} بقيمة ${Math.abs(diff)} د.ع.`)
    };

    setDailyRegisters((prev) => [newRegister, ...prev]);

    addAuditLog(
      `إغلاق واعتماد الصندوق اليومي (${todayStr})`,
      'financial',
      status === 'balanced' ? 'info' : 'warning',
      `تم إجراء الجرد اليومي للخزينة بواسطة [${currentUser.nameAr}]. الرصيد الدفتري: ${liveSafeBalance.toLocaleString()} د.ع | العد الفعلي: ${actualPhysicalCount.toLocaleString()} د.ع | الحالة: ${status === 'balanced' ? 'مطابق تماماً' : status === 'surplus' ? `فائض ${diff} د.ع` : `عجز ${diff} د.ع`}.`
    );

    showNotification(
      'تم إغلاق الصندوق',
      status === 'balanced'
        ? 'تم اعتماد الجرد اليومي وتأكيد التطابق التام للصندوق.'
        : `تم اعتماد الجرد مع تسجيل فارق (${diff > 0 ? '+' : ''}${diff.toLocaleString()} د.ع).`,
      status === 'balanced' ? 'success' : 'warning'
    );

    return { success: true, register: newRegister };
  };

  // --- Task 4: Smart Invoices Actions ---
  const addInvoice = (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdBy' | 'qrCodeData'>): boolean => {
    if (!hasPermission('canCreateInvoice')) {
      showNotification('غير مصرح', 'ليس لديك صلاحية إنشاء فواتير نظامية.', 'error');
      return false;
    }

    if (!inv.clientName.trim() || inv.items.length === 0 || inv.items.some((item) => !item.description.trim())) {
      showNotification('بيانات الفاتورة ناقصة', 'أدخل اسم الطرف ووصف كل بند قبل الحفظ.', 'error');
      return false;
    }

    const totals = calculateInvoiceTotals(inv.items, inv.discountPercent, inv.taxRate);
    if (totals.grandTotal <= 0) {
      showNotification('قيمة غير صحيحة', 'يجب أن يكون إجمالي الفاتورة أكبر من صفر.', 'error');
      return false;
    }
    const normalizedItems = inv.items.map((item) => ({
      ...item,
      quantity: nonNegative(item.quantity),
      unitPrice: nonNegative(item.unitPrice),
      total: calculateQuantityTotal(item.quantity, item.unitPrice)
    }));

    const seq = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-LM-2026-${seq}`;
    const timestamp = new Date().toISOString();

    const qrData = generateZatcaQrData(
      COMPANY_BILLING_INFO.nameAr,
      COMPANY_BILLING_INFO.vatNumber,
      timestamp,
      totals.grandTotal,
      totals.taxAmount
    );

    const newInvoice: Invoice = {
      ...inv,
      items: normalizedItems,
      subtotal: totals.subtotal,
      discountPercent: totals.discountPercent,
      discountAmount: totals.discountAmount,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      grandTotal: totals.grandTotal,
      paidAmount: 0,
      remainingAmount: totals.grandTotal,
      status: 'pending',
      id: `INV-${Date.now().toString().slice(-4)}`,
      invoiceNumber,
      createdBy: currentUser.nameAr,
      qrCodeData: qrData
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    addAuditLog(
      `إصدار فاتورة جديدة (${invoiceNumber})`,
      'financial',
      'info',
      `تم إصدار ${inv.type === 'sales' ? 'فاتورة مستخلص مبيعات' : 'فاتورة شراء وتوريد'} بقيمة إجمالية ${totals.grandTotal.toLocaleString()} د.ع للعميل/المورد [${inv.clientName}].`
    );

    showNotification('تم إصدار الفاتورة', `تم إنشاء الفاتورة رقم ${invoiceNumber} وتوليد رمز ZATCA المعتمد بنجاح.`, 'success');
    return true;
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus, paidAmount?: number): boolean => {
    if (!hasPermission('canEditInvoice')) {
      showNotification('غير مصرح', 'ليس لديك صلاحية تعديل حالة الفواتير أو تسجيل السداد.', 'error');
      return false;
    }

    let updatedInv: Invoice | null = null;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const requestedPaid = paidAmount !== undefined ? paidAmount : inv.paidAmount;
          const payment = calculateInvoicePayment(inv.grandTotal, requestedPaid);
          updatedInv = {
            ...inv,
            paidAmount: payment.paidAmount,
            remainingAmount: payment.remainingAmount,
            status: status === 'cancelled' ? 'cancelled' : payment.status
          };
          return updatedInv;
        }
        return inv;
      })
    );

    if (updatedInv) {
      addAuditLog(
        `تحديث سداد الفاتورة (${(updatedInv as Invoice).invoiceNumber})`,
        'financial',
        'info',
        `تحديث حالة الفاتورة إلى [${status}] والمبلغ المسدد: ${(updatedInv as Invoice).paidAmount.toLocaleString()} د.ع بواسطة [${currentUser.nameAr}].`
      );
      showNotification('تم التحديث', 'تم تسجيل الدفعة وتحديث حالة الفاتورة والمتبقي بنجاح.', 'success');
    }

    return true;
  };

  const deleteInvoice = (id: string): boolean => {
    if (!hasPermission('canDeleteRecords')) {
      addAuditLog(
        'منع أمني: محاولة حذف فاتورة بدون صلاحية المدير العام',
        'security',
        'warning',
        `حاول [${currentUser.nameAr}] حذف الفاتورة (${id}) ولكن النظام أوقف العملية وفق سياسة الأمان.`
      );
      showNotification('محظور أمنياً', 'حذف الفواتير المسجلة مقتصر حصراً على المدير العام لمنع التلاعب المالي.', 'error');
      return false;
    }

    const target = invoices.find((inv) => inv.id === id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));

    addAuditLog(
      `حذف فاتورة نظامية نهائياً (${target?.invoiceNumber || id})`,
      'financial',
      'critical',
      `قام المدير العام [${currentUser.nameAr}] بحذف الفاتورة رقم ${target?.invoiceNumber} بقيمة ${target?.grandTotal.toLocaleString()} د.ع.`
    );

    showNotification('تم الحذف', 'تم حذف الفاتورة وتوثيق العملية في سجل التدقيق الأمني.', 'warning');
    return true;
  };

  // -------------------------------------------------------------
  // TASK 5: PAYROLL & WORKFORCE MANAGEMENT ACTIONS
  // -------------------------------------------------------------

  const addEmployee = (empData: Omit<Employee, 'id' | 'code'>): boolean => {
    const newId = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
    const newCode = `LM-${empData.department.toUpperCase().substring(0, 3)}-${String(employees.length + 1).padStart(2, '0')}`;
    const newEmp: Employee = {
      ...empData,
      basicSalary: nonNegative(empData.basicSalary),
      housingAllowance: nonNegative(empData.housingAllowance),
      transportAllowance: nonNegative(empData.transportAllowance),
      otherAllowances: nonNegative(empData.otherAllowances),
      totalMonthlyPackage: calculateEmployeePackage(
        empData.basicSalary,
        empData.housingAllowance,
        empData.transportAllowance,
        empData.otherAllowances
      ),
      id: newId,
      code: newCode
    };
    setEmployees((prev) => [newEmp, ...prev]);
    addAuditLog(
      `تسجيل موظف جديد في الكادر (${newEmp.nameAr})`,
      'operations',
      'info',
      `تم إدراج الموظف ${newEmp.nameAr} - ${newEmp.roleTitle} بحزمة شهرية ${newEmp.totalMonthlyPackage.toLocaleString()} د.ع بواسطة [${currentUser.nameAr}].`
    );
    showNotification('تمت إضافة الموظف', `تم تسجيل الموظف ${newEmp.nameAr} بنجاح في سجل الكادر الدائم.`);
    return true;
  };

  const addSalarySlip = (slipData: Omit<MonthlySalarySlip, 'id' | 'slipNumber'>): boolean => {
    const slipId = `SLIP-${Date.now()}`;
    const slipNumber = `PAY-${slipData.monthYear}-${String(salarySlips.length + 1).padStart(3, '0')}`;
    const salaryTotals = calculateMonthlySalary(slipData);
    const newSlip: MonthlySalarySlip = {
      ...slipData,
      basicSalary: nonNegative(slipData.basicSalary),
      totalAllowances: nonNegative(slipData.totalAllowances),
      overtimeHours: nonNegative(slipData.overtimeHours),
      overtimeAmount: nonNegative(slipData.overtimeAmount),
      bonuses: nonNegative(slipData.bonuses),
      advancesDeduction: nonNegative(slipData.advancesDeduction),
      absenceDays: nonNegative(slipData.absenceDays),
      absenceDeduction: nonNegative(slipData.absenceDeduction),
      penaltiesDeduction: nonNegative(slipData.penaltiesDeduction),
      netPayable: salaryTotals.netPayable,
      id: slipId,
      slipNumber
    };
    setSalarySlips((prev) => [newSlip, ...prev]);
    showNotification('تم إصدار مسير الراتب', `تم إنشاء مسير الراتب برقم ${slipNumber} بنجاح.`);
    return true;
  };

  const approveAndDisburseSalary = (slipId: string): boolean => {
    const slip = salarySlips.find((s) => s.id === slipId);
    if (!slip) return false;
    if (slip.status === 'paid') {
      showNotification('تنبيه', 'تم صرف هذا الراتب مسبقاً ولا يمكن تكرار الصرف.', 'warning');
      return false;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Automatically disburse from Treasury
    addCashVoucher({
      type: 'cash_out',
      date: todayStr,
      amount: slip.netPayable,
      category: 'payroll',
      categoryLabelAr: 'صرف رواتب الكادر الهندسي والإداري',
      partyName: slip.employeeName,
      partyType: 'employee',
      paymentMethod: 'bank_transfer',
      description: `صرف صافي راتب شهر (${slip.monthYear}) للموظف: ${slip.employeeName} - ${slip.roleTitle}`,
      referenceDocNumber: slip.slipNumber,
      notes: `تم اعتماد الصرف الصافي بمبلغ ${slip.netPayable.toLocaleString()} د.ع بعد احتساب البدلات واستقطاع السلف.`
    });

    setSalarySlips((prev) =>
      prev.map((s) =>
        s.id === slipId
          ? { ...s, status: 'paid', paidAt: todayStr }
          : s
      )
    );

    addAuditLog(
      `اعتماد وصرف راتب موظف (${slip.employeeName})`,
      'financial',
      'critical',
      `تم اعتماد وصرف صافي راتب شهر ${slip.monthYear} للموظف [${slip.employeeName}] بقيمة ${slip.netPayable.toLocaleString()} د.ع وإنشاء سند صرف آلياً بالخزينة بواسطة [${currentUser.nameAr}].`
    );

    showNotification('تم الصرف بنجاح', `تم صرف راتب ${slip.employeeName} وتوليد سند صرف بالخزينة تلقائياً.`);
    return true;
  };

  const addProjectWorker = (workerData: Omit<ProjectWorker, 'id' | 'code'>): boolean => {
    const newId = `WRK-${String(projectWorkers.length + 1).padStart(3, '0')}`;
    const newCode = `LAB-${String(100 + projectWorkers.length + 1)}`;
    const newWorker: ProjectWorker = {
      ...workerData,
      dailyRate: nonNegative(workerData.dailyRate),
      id: newId,
      code: newCode
    };
    setProjectWorkers((prev) => [...prev, newWorker]);
    showNotification('تم تسجيل العامل', `تمت إضافة العامل ${newWorker.nameAr} (${newWorker.craft}) بمعدل ${newWorker.dailyRate} د.ع/يوم.`);
    return true;
  };

  const updateWorkerAttendance = (
    timesheetId: string,
    workerId: string,
    day: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri',
    value: number
  ) => {
    setWeeklyTimesheets((prev) =>
      prev.map((ts) => {
        if (ts.id !== timesheetId) return ts;
        const newEntries = ts.entries.map((entry) => {
          if (entry.workerId !== workerId) return entry;
          const updatedDays = { ...entry.days, [day]: Math.min(1, nonNegative(value)) };
          const calculated = calculateWeeklyWorkerPay({
            days: Object.values(updatedDays),
            dailyRate: entry.dailyRate,
            overtimeHours: entry.overtimeHours,
            overtimeRate: entry.overtimeRate,
            advances: entry.advances
          });
          return {
            ...entry,
            days: updatedDays,
            ...calculated
          };
        });
        const weeklyTotals = calculateWeeklyTotals(newEntries);
        return {
          ...ts,
          entries: newEntries,
          ...weeklyTotals
        };
      })
    );
  };

  const updateWorkerOvertimeAndAdvances = (
    timesheetId: string,
    workerId: string,
    overtimeHours: number,
    advances: number
  ) => {
    setWeeklyTimesheets((prev) =>
      prev.map((ts) => {
        if (ts.id !== timesheetId) return ts;
        const newEntries = ts.entries.map((entry) => {
          if (entry.workerId !== workerId) return entry;
          const calculated = calculateWeeklyWorkerPay({
            days: Object.values(entry.days),
            dailyRate: entry.dailyRate,
            overtimeHours,
            overtimeRate: entry.overtimeRate,
            advances
          });
          return {
            ...entry,
            ...calculated
          };
        });
        const weeklyTotals = calculateWeeklyTotals(newEntries);
        return {
          ...ts,
          entries: newEntries,
          ...weeklyTotals
        };
      })
    );
  };

  const approveAndDisburseWeeklyTimesheet = (timesheetId: string): boolean => {
    const timesheet = weeklyTimesheets.find((ts) => ts.id === timesheetId);
    if (!timesheet) return false;
    if (timesheet.status === 'paid') {
      showNotification('تنبيه', 'تم صرف هذا الكشف مسبقاً.', 'warning');
      return false;
    }
    if (timesheet.totalWeeklyNetPayable > liveSafeBalance) {
      showNotification('رصيد الصندوق غير كافٍ', `المتاح ${liveSafeBalance.toLocaleString()} د.ع ولا يغطي صافي الأجور.`, 'error');
      return false;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Create automatic Cash Out Voucher from Safe
    addCashVoucher({
      type: 'cash_out',
      date: todayStr,
      amount: timesheet.totalWeeklyNetPayable,
      category: 'daily_wages',
      categoryLabelAr: 'أجور عمالة مياومة وأسبوعية',
      partyName: `عمالة مشروع: ${timesheet.projectName}`,
      partyType: 'laborer',
      paymentMethod: 'cash',
      description: `صرف أجور عمالة مياومة للأسبوع (${timesheet.weekCode}) - عدد ${timesheet.entries.length} عمال بإشراف ${timesheet.supervisorName}`,
      projectId: timesheet.projectId,
      projectName: timesheet.projectName,
      referenceDocNumber: timesheet.weekCode,
      notes: `إجمالي الاستحقاق: ${timesheet.totalWeeklyGross.toLocaleString()} د.ع | السلف المخصومة: ${timesheet.totalWeeklyAdvances.toLocaleString()} د.ع | الصافي المصروف: ${timesheet.totalWeeklyNetPayable.toLocaleString()} د.ع.`
    });

    setWeeklyTimesheets((prev) =>
      prev.map((ts) =>
        ts.id === timesheetId
          ? {
              ...ts,
              status: 'paid',
              paidAt: todayStr,
              entries: ts.entries.map((e) => ({ ...e, isPaid: true }))
            }
          : ts
      )
    );

    addAuditLog(
      `اعتماد وصرف كشف أجور العمالة الميدانية (${timesheet.weekCode})`,
      'financial',
      'critical',
      `تم اعتماد وصرف كشف أجور عمالة [${timesheet.projectName}] بمبلغ ${timesheet.totalWeeklyNetPayable.toLocaleString()} د.ع نقدياً من الخزينة بواسطة [${currentUser.nameAr}].`
    );

    showNotification('تم الصرف الميداني بنجاح', `تم صرف أجور عمالة ${timesheet.projectName} بقيمة ${timesheet.totalWeeklyNetPayable.toLocaleString()} د.ع وقيدها بالخزينة.`);
    return true;
  };

  // -------------------------------------------------------------
  // TASK 6: OPERATIONAL PROCUREMENT, FUEL & OVERHEADS ACTIONS
  // -------------------------------------------------------------

  const addProcurementItem = (itemData: Omit<DailyProcurementItem, 'id' | 'purchaseNumber' | 'recordedBy'>): boolean => {
    const totalCost = calculateQuantityTotal(itemData.quantity, itemData.unitPrice);
    if (!itemData.itemName.trim() || !itemData.supplierShop.trim() || totalCost <= 0) {
      showNotification('بيانات المشتريات ناقصة', 'أدخل الصنف والمورد وكمية وسعرًا أكبر من صفر.', 'error');
      return false;
    }
    if (itemData.paymentMethod === 'cash_safe' && totalCost > liveSafeBalance) {
      showNotification('رصيد الصندوق غير كافٍ', `المتاح ${liveSafeBalance.toLocaleString()} د.ع.`, 'error');
      return false;
    }
    const newId = `PUR-${Date.now()}`;
    const newNumber = `PUR-${new Date().getFullYear()}-${String(procurements.length + 1).padStart(4, '0')}`;
    const newItem: DailyProcurementItem = {
      ...itemData,
      quantity: nonNegative(itemData.quantity),
      unitPrice: nonNegative(itemData.unitPrice),
      totalCost,
      id: newId,
      purchaseNumber: newNumber,
      recordedBy: currentUser.nameAr
    };

    addCashVoucher({
        type: 'cash_out',
        date: itemData.date,
        amount: totalCost,
        category: 'materials',
        categoryLabelAr: 'شراء مواد ومستهلكات موقع',
        partyName: itemData.supplierShop,
        partyType: 'supplier',
        paymentMethod: itemData.paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cash',
        description: `شراء: ${itemData.itemName} (${itemData.quantity} ${itemData.unit}) - ${itemData.projectName || 'استخدام داخلي'}`,
        projectId: itemData.projectId,
        projectName: itemData.projectName,
        referenceDocNumber: newNumber,
        notes: `مشتريات عاجلة بواسطة [${itemData.buyerName}] من [${itemData.supplierShop}].`
      });

    setProcurements((prev) => [newItem, ...prev]);

    addAuditLog(
      `تسجيل مشتريات موقع (${newItem.itemName})`,
      'financial',
      'info',
      `تم قيد شراء ${newItem.itemName} بقيمة ${newItem.totalCost.toLocaleString()} د.ع لمشروع [${newItem.projectName || 'المقر'}] بواسطة [${currentUser.nameAr}].`
    );

    showNotification('تم تسجيل المشتريات', `تم تسجيل ${newItem.itemName} بقيمة ${newItem.totalCost.toLocaleString()} د.ع.`);
    return true;
  };

  const addFuelLog = (logData: Omit<FuelFleetLog, 'id' | 'logNumber' | 'distanceOrHours' | 'consumptionRate' | 'isAnomaly' | 'loggedBy'>): boolean => {
    const newId = `FUEL-${Date.now()}`;
    const newNumber = `FL-${new Date().getFullYear()}-${String(fuelLogs.length + 1).padStart(3, '0')}`;

    // Calculate consumption rate
    const metrics = calculateFuelMetrics({
      liters: logData.liters,
      costPerLiter: logData.costPerLiter,
      currentOdometer: logData.currentOdometer,
      previousOdometer: logData.previousOdometer,
      isHourly: logData.vehicleType === 'heavy_machinery' || logData.vehicleType === 'generator',
      standardBenchmarkRate: logData.standardBenchmarkRate
    });
    if (!logData.vehicleName.trim() || !logData.driverOrOperator.trim() || metrics.liters <= 0 || metrics.totalAmount <= 0) {
      showNotification('بيانات الوقود ناقصة', 'أدخل اسم الآلية والسائق وكمية الوقود وسعر اللتر.', 'error');
      return false;
    }
    if (metrics.distanceOrHours <= 0) {
      showNotification('قراءة عداد غير صحيحة', 'يجب أن تكون القراءة الحالية أكبر من القراءة السابقة.', 'error');
      return false;
    }
    if (logData.paymentMethod === 'cash_safe' && metrics.totalAmount > liveSafeBalance) {
      showNotification('رصيد الصندوق غير كافٍ', `المتاح ${liveSafeBalance.toLocaleString()} د.ع.`, 'error');
      return false;
    }

    const { distanceOrHours, consumptionRate, isAnomaly } = metrics;
    const anomalyReason = isAnomaly
      ? `استهلاك مرتفع (+${Math.round(metrics.variancePercent)}% عن المعيار المقدر) - يتطلب فحص المحرك أو فلاتر الوقود أو التحقق من الهدر الميداني`
      : undefined;

    const newLog: FuelFleetLog = {
      ...logData,
      liters: metrics.liters,
      costPerLiter: nonNegative(logData.costPerLiter),
      totalAmount: metrics.totalAmount,
      standardBenchmarkRate: metrics.benchmark,
      id: newId,
      logNumber: newNumber,
      distanceOrHours,
      consumptionRate,
      isAnomaly,
      anomalyReason,
      loggedBy: currentUser.nameAr
    };

    addCashVoucher({
        type: 'cash_out',
        date: logData.date,
        amount: metrics.totalAmount,
        category: 'fuel_maintenance',
        categoryLabelAr: 'وقود ومحروقات الآليات',
        partyName: logData.gasStation,
        partyType: 'supplier',
        paymentMethod: logData.paymentMethod === 'cash_safe' ? 'cash' : 'bank_transfer',
        description: `تعبئة وقود ${logData.fuelType === 'diesel' ? 'ديزل' : 'بنزين'} لآلية: ${logData.vehicleName} (${logData.liters} لتر)`,
        projectId: logData.projectId,
        projectName: logData.projectName,
        referenceDocNumber: newNumber,
        notes: `السائق: ${logData.driverOrOperator} | قراءة العداد: ${logData.currentOdometer}`
      });

    setFuelLogs((prev) => [newLog, ...prev]);

    if (isAnomaly) {
      showNotification('تنبيه استهلاك وقود مرتفع', `الآلية ${newLog.vehicleName} تجاوزت المعدل المعياري بنسبة ملحوظة!`, 'warning');
    } else {
      showNotification('تم تسجيل استهلاك الوقود', `تم تسجيل تعبئة وقود للآلية ${newLog.vehicleName} بنجاح.`);
    }

    return true;
  };

  const addOfficeExpense = (expData: Omit<OfficeOverheadExpense, 'id' | 'expenseNumber' | 'recordedBy'>): boolean => {
    const amount = nonNegative(expData.amount);
    if (!expData.title.trim() || !expData.recipientOrVendor.trim() || amount <= 0) {
      showNotification('بيانات المصروف ناقصة', 'أدخل وصف المصروف والجهة المستلمة ومبلغًا أكبر من صفر.', 'error');
      return false;
    }
    if (expData.paymentMethod === 'cash_safe' && amount > liveSafeBalance) {
      showNotification('رصيد الصندوق غير كافٍ', `المتاح ${liveSafeBalance.toLocaleString()} د.ع.`, 'error');
      return false;
    }
    const newId = `EXP-${Date.now()}`;
    const newNumber = `OEX-${new Date().getFullYear()}-${String(officeExpenses.length + 1).padStart(3, '0')}`;
    const newExp: OfficeOverheadExpense = {
      ...expData,
      amount,
      id: newId,
      expenseNumber: newNumber,
      recordedBy: currentUser.nameAr
    };

    addCashVoucher({
        type: 'cash_out',
        date: expData.date,
        amount,
        category: 'utilities',
        categoryLabelAr: expData.categoryAr,
        partyName: expData.recipientOrVendor,
        partyType: 'supplier',
        paymentMethod: expData.paymentMethod === 'cash_safe' ? 'cash' : expData.paymentMethod,
        description: `مصروف إداري/مكتبي: ${expData.title}`,
        referenceDocNumber: newNumber,
        notes: expData.notes
      });

    setOfficeExpenses((prev) => [newExp, ...prev]);

    addAuditLog(
      `تسجيل مصروف مكتبي وإداري (${newExp.title})`,
      'financial',
      'info',
      `تم قيد مصروف ${newExp.categoryAr} بقيمة ${newExp.amount.toLocaleString()} د.ع لصالح [${newExp.recipientOrVendor}] بواسطة [${currentUser.nameAr}].`
    );

    showNotification('تم تسجيل المصروف الإداري', `تم تسجيل بند ${newExp.title} بقيمة ${newExp.amount.toLocaleString()} د.ع.`);
    return true;
  };

  // -------------------------------------------------------------
  // TASK 7: SUBCONTRACTORS, VENDORS & RENTAL FLEET HANDLERS
  // -------------------------------------------------------------

  const addVendor = (
    vendorData: Omit<SubcontractorVendor, 'id' | 'vendorNumber' | 'totalBilled' | 'totalPaid' | 'currentBalance'>
  ): boolean => {
    const newId = `VND-${Date.now()}`;
    const newNumber = `VND-2026-${String(vendors.length + 1).padStart(3, '0')}`;
    const newVendor: SubcontractorVendor = {
      ...vendorData,
      id: newId,
      vendorNumber: newNumber,
      totalBilled: 0,
      totalPaid: 0,
      currentBalance: 0
    };
    setVendors((prev) => [newVendor, ...prev]);
    addAuditLog(
      `إضافة مورد/مقاول جديد (${newVendor.name})`,
      'financial',
      'info',
      `تم تسجيل بطاقة ${newVendor.typeAr} [${newVendor.name}] برقم [${newNumber}] بواسطة [${currentUser.nameAr}].`
    );
    showNotification('تمت إضافة المورد/المقاول', `تم تسجيل ${newVendor.name} بنجاح.`);
    return true;
  };

  const addVendorBill = (
    vendorId: string,
    amount: number,
    description: string,
    referenceDocNumber: string,
    projectId?: string
  ): boolean => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return false;
    const safeAmount = nonNegative(amount);
    if (safeAmount <= 0 || !description.trim() || !referenceDocNumber.trim()) {
      showNotification('بيانات غير مكتملة', 'أدخل مبلغًا أكبر من صفر ووصفًا ورقم مستند.', 'error');
      return false;
    }

    const prj = projects.find((p) => p.id === projectId);
    const newTxId = `VTX-${Date.now()}`;
    const newTxNumber = `VTX-2026-${String(vendorTransactions.length + 1).padStart(4, '0')}`;
    const newBalance = calculateLedgerBalance(vendor.totalBilled + safeAmount, vendor.totalPaid);

    const newTx: VendorTransaction = {
      id: newTxId,
      transactionNumber: newTxNumber,
      vendorId,
      vendorName: vendor.name,
      date: new Date().toISOString().split('T')[0],
      type: 'bill',
      amount: safeAmount,
      projectId,
      projectName: prj?.nameAr,
      referenceDocNumber,
      description,
      balanceAfter: newBalance,
      recordedBy: currentUser.nameAr
    };

    setVendorTransactions((prev) => [newTx, ...prev]);
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          return {
            ...v,
            totalBilled: roundMoney(v.totalBilled + safeAmount),
            currentBalance: calculateLedgerBalance(v.totalBilled + safeAmount, v.totalPaid)
          };
        }
        return v;
      })
    );

    addAuditLog(
      `قيد فاتورة/مستخلص مقاول (${vendor.name})`,
      'financial',
      'info',
      `تم قيد استحقاق بمبلغ ${amount.toLocaleString()} د.ع لحساب [${vendor.name}] بموجب مستند [${referenceDocNumber}].`
    );

    showNotification('تم قيد المستخلص/الفاتورة', `تم إدراج مستحق بقيمة ${amount.toLocaleString()} د.ع في ذمة الشركة.`);
    return true;
  };

  const payVendor = (
    vendorId: string,
    amount: number,
    paymentMethod: 'cash_safe' | 'bank_transfer' | 'check',
    description: string,
    referenceDocNumber?: string
  ): boolean => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return false;

    const safeAmount = nonNegative(amount);
    if (safeAmount <= 0) {
      showNotification('قيمة غير صحيحة', 'يجب أن تكون الدفعة أكبر من صفر.', 'error');
      return false;
    }
    if (safeAmount > vendor.currentBalance) {
      showNotification('دفعة تتجاوز المستحق', `المبلغ الأقصى الممكن سداده هو ${vendor.currentBalance.toLocaleString()} د.ع.`, 'error');
      return false;
    }

    if (paymentMethod === 'cash_safe' && liveSafeBalance < safeAmount) {
      showNotification(
        'رصيد الصندوق غير كافٍ',
        `الرصيد المتاح ${liveSafeBalance.toLocaleString()} د.ع لا يغطي الدفعة.`,
        'error'
      );
      return false;
    }

    const newTxId = `VTX-${Date.now()}`;
    const newTxNumber = `VTX-2026-${String(vendorTransactions.length + 1).padStart(4, '0')}`;
    const newBalance = calculateLedgerBalance(vendor.totalBilled, vendor.totalPaid + safeAmount);

    addCashVoucher({
        type: 'cash_out',
        date: new Date().toISOString().split('T')[0],
        amount: safeAmount,
        category: vendor.type === 'subcontractor' ? 'subcontractor' : 'materials',
        categoryLabelAr: vendor.type === 'subcontractor' ? 'دفعات مقاولي باطن' : 'توريدات ومواد',
        partyName: vendor.name,
        partyType: 'supplier',
        paymentMethod: paymentMethod === 'cash_safe' ? 'cash' : paymentMethod,
        description: `سداد دفعة للمورد/المقاول: ${description}`,
        referenceDocNumber: referenceDocNumber || newTxNumber
      });

    const newTx: VendorTransaction = {
      id: newTxId,
      transactionNumber: newTxNumber,
      vendorId,
      vendorName: vendor.name,
      date: new Date().toISOString().split('T')[0],
      type: 'payment',
      amount: safeAmount,
      paymentMethod,
      referenceDocNumber,
      linkedCashVoucherId: undefined,
      description,
      balanceAfter: newBalance,
      recordedBy: currentUser.nameAr
    };

    setVendorTransactions((prev) => [newTx, ...prev]);
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          return {
            ...v,
            totalPaid: roundMoney(v.totalPaid + safeAmount),
            currentBalance: calculateLedgerBalance(v.totalBilled, v.totalPaid + safeAmount)
          };
        }
        return v;
      })
    );

    addAuditLog(
      `سداد دفعة مورد/مقاول (${vendor.name})`,
      'financial',
      'info',
      `تم سداد مبلغ ${amount.toLocaleString()} د.ع لحساب [${vendor.name}] طريقة الدفع: [${
        paymentMethod === 'cash_safe'
          ? 'نقداً من الخزينة'
          : paymentMethod === 'bank_transfer'
          ? 'تحويل بنكي'
          : 'شيك مصرفي'
      }].`
    );

    showNotification('تم سداد الدفعة بنجاح', `تم صرف ${amount.toLocaleString()} د.ع لحساب [${vendor.name}].`);
    return true;
  };

  const addRentalMachinery = (
    machineryData: Omit<RentalMachinery, 'id' | 'machineryNumber' | 'totalUnitsWorked' | 'totalAccruedCost' | 'totalPaid' | 'balanceDue'>
  ): boolean => {
    const newId = `RNT-${Date.now()}`;
    const newNumber = `RNT-2026-${String(rentalMachinery.length + 1).padStart(3, '0')}`;
    const newMachine: RentalMachinery = {
      ...machineryData,
      id: newId,
      machineryNumber: newNumber,
      totalUnitsWorked: 0,
      totalAccruedCost: 0,
      totalPaid: 0,
      balanceDue: 0
    };
    setRentalMachinery((prev) => [newMachine, ...prev]);
    addAuditLog(
      `إضافة آلية/سيارة مؤجرة (${newMachine.machineryName})`,
      'operations',
      'info',
      `تم قيد الآلية المؤجرة [${newMachine.machineryName}] التابعة للمؤجر [${newMachine.ownerName}] بمعدل [${newMachine.unitRate} د.ع].`
    );
    showNotification('تم تسجيل الآلية المؤجرة', `تم إدراج ${newMachine.machineryName} في سجل الأسطول المؤجر.`);
    return true;
  };

  const logRentalWork = (
    machineryId: string,
    unitsWorked: number,
    workDescription: string,
    date: string,
    siteSupervisor: string
  ): boolean => {
    const machine = rentalMachinery.find((m) => m.id === machineryId);
    if (!machine) return false;

    const safeUnits = nonNegative(unitsWorked);
    if (safeUnits <= 0 || !workDescription.trim() || !siteSupervisor.trim()) {
      showNotification('بيانات التشغيل ناقصة', 'أدخل وحدات تشغيل أكبر من صفر ووصف العمل واسم المشرف.', 'error');
      return false;
    }

    const totalAmount = calculateQuantityTotal(safeUnits, machine.unitRate);
    const newLogId = `RWL-${Date.now()}`;
    const newLogNumber = `RWL-2026-${String(rentalWorkLogs.length + 1).padStart(4, '0')}`;

    const newLog: RentalWorkLog = {
      id: newLogId,
      logNumber: newLogNumber,
      machineryId,
      machineryName: machine.machineryName,
      date,
      unitsWorked: safeUnits,
      unitRate: nonNegative(machine.unitRate),
      totalAmount,
      workDescription,
      siteSupervisor,
      projectId: machine.assignedProjectId,
      projectName: machine.assignedProjectName
    };

    setRentalWorkLogs((prev) => [newLog, ...prev]);
    setRentalMachinery((prev) =>
      prev.map((m) => {
        if (m.id === machineryId) {
          const newTotalUnits = roundMoney(m.totalUnitsWorked + safeUnits);
          const newTotalAccrued = roundMoney(m.totalAccruedCost + totalAmount);
          return {
            ...m,
            totalUnitsWorked: newTotalUnits,
            totalAccruedCost: newTotalAccrued,
            balanceDue: calculateLedgerBalance(newTotalAccrued, m.totalPaid)
          };
        }
        return m;
      })
    );

    addAuditLog(
      `تسجيل ساعات/عمل آلية مؤجرة (${machine.machineryName})`,
      'operations',
      'info',
      `تم تسجيل ${unitsWorked} وحدة عمل بقيمة ${totalAmount.toLocaleString()} د.ع بمشروع [${machine.assignedProjectName}].`
    );

    showNotification(
      'تم تسجيل تشغيل الآلية',
      `تم احتساب ${unitsWorked} وحدة بقيمة ${totalAmount.toLocaleString()} د.ع مستحقة للمؤجر.`
    );
    return true;
  };

  const payRentalMachinery = (
    machineryId: string,
    amount: number,
    paymentMethod: 'cash_safe' | 'bank_transfer' | 'check',
    notes?: string
  ): boolean => {
    const machine = rentalMachinery.find((m) => m.id === machineryId);
    if (!machine) return false;

    const safeAmount = nonNegative(amount);
    if (safeAmount <= 0) {
      showNotification('قيمة غير صحيحة', 'يجب أن تكون الدفعة أكبر من صفر.', 'error');
      return false;
    }
    if (safeAmount > machine.balanceDue) {
      showNotification('دفعة تتجاوز المستحق', `المبلغ الأقصى الممكن سداده هو ${machine.balanceDue.toLocaleString()} د.ع.`, 'error');
      return false;
    }

    if (paymentMethod === 'cash_safe' && liveSafeBalance < safeAmount) {
      showNotification('رصيد الصندوق غير كافٍ', `الرصيد المتاح لا يغطي دفعة الآلية المؤجرة.`, 'error');
      return false;
    }

    const newPayId = `RNP-${Date.now()}`;
    const newPayNumber = `RNP-2026-${String(rentalPayments.length + 1).padStart(3, '0')}`;
    addCashVoucher({
        type: 'cash_out',
        date: new Date().toISOString().split('T')[0],
        amount: safeAmount,
        category: 'petty_cash',
        categoryLabelAr: 'أجور آليات وسيارات مؤجرة',
        partyName: machine.ownerName,
        partyType: 'supplier',
        paymentMethod: paymentMethod === 'cash_safe' ? 'cash' : paymentMethod,
        description: `سداد أجور تأجير: ${machine.machineryName} (${machine.ownerName})`,
        projectId: machine.assignedProjectId,
        projectName: machine.assignedProjectName,
        referenceDocNumber: newPayNumber,
        notes
      });

    const newPayment: RentalPayment = {
      id: newPayId,
      paymentNumber: newPayNumber,
      machineryId,
      machineryName: machine.machineryName,
      ownerName: machine.ownerName,
      date: new Date().toISOString().split('T')[0],
      amount: safeAmount,
      paymentMethod,
      linkedCashVoucherId: undefined,
      referenceDocNumber: newPayNumber,
      notes,
      recordedBy: currentUser.nameAr
    };

    setRentalPayments((prev) => [newPayment, ...prev]);
    setRentalMachinery((prev) =>
      prev.map((m) => {
        if (m.id === machineryId) {
          const newPaid = roundMoney(m.totalPaid + safeAmount);
          return {
            ...m,
            totalPaid: newPaid,
            balanceDue: calculateLedgerBalance(m.totalAccruedCost, newPaid)
          };
        }
        return m;
      })
    );

    addAuditLog(
      `سداد أجور تأجير آلية (${machine.machineryName})`,
      'financial',
      'info',
      `تم سداد ${amount.toLocaleString()} د.ع للمؤجر [${machine.ownerName}] طريقة الدفع: [${paymentMethod}].`
    );

    showNotification('تم سداد أجور الآلية', `تم صرف ${amount.toLocaleString()} د.ع لحساب [${machine.ownerName}].`);
    return true;
  };

  // -------------------------------------------------------------
  // TASK 8: BACKUP, EXPORT & RESTORE ENGINE
  // -------------------------------------------------------------

  const exportSystemBackup = (): ErpBackupData => {
    return {
      exportedAt: new Date().toISOString(),
      exportVersion: '2.5.0-PROD',
      appTitle: 'نظام لمسات المعمار لإدارة الموارد والمشاريع',
      companyName: COMPANY_BILLING_INFO.nameAr,
      licenseHash: license.signatureChecksum,
      data: {
        projects,
        transactions,
        invoices,
        cashVouchers,
        dailyRegisters,
        openingBalance,
        siteLogs,
        employees,
        salarySlips,
        projectWorkers,
        weeklyTimesheets,
        procurements,
        fuelLogs,
        officeExpenses,
        vendors,
        vendorTransactions,
        rentalMachinery,
        rentalWorkLogs,
        rentalPayments,
        auditLogs
      }
    };
  };

  const downloadBackupFile = () => {
    const backup = exportSystemBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lamasat_AlMeamar_Backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    addAuditLog(
      'تصدير نسخة احتياطية مشفرة للنظام',
      'security',
      'info',
      `تم تنزيل نسخة احتياطية كاملة لبيانات النظام بواسطة [${currentUser.nameAr}].`
    );
    showNotification('تم تحميل النسخة الاحتياطية', 'تم تصدير ملف النسخة الاحتياطية بنجاح إلى جهازك.');
  };

  const restoreSystemBackup = (jsonContent: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonContent) as ErpBackupData;
      if (!parsed.data || !parsed.exportVersion) {
        return { success: false, message: 'ملف النسخة الاحتياطية غير صالح أو تالف.' };
      }

      if (parsed.data.projects) setProjects(parsed.data.projects);
      if (parsed.data.transactions) setTransactions(parsed.data.transactions);
      if (parsed.data.invoices) setInvoices(parsed.data.invoices);
      if (parsed.data.cashVouchers) setCashVouchers(parsed.data.cashVouchers);
      if (parsed.data.dailyRegisters) setDailyRegisters(parsed.data.dailyRegisters);
      if (typeof parsed.data.openingBalance === 'number') setOpeningBalance(nonNegative(parsed.data.openingBalance));
      if (parsed.data.siteLogs) setSiteLogs(parsed.data.siteLogs);
      if (parsed.data.employees) setEmployees(parsed.data.employees);
      if (parsed.data.salarySlips) setSalarySlips(parsed.data.salarySlips);
      if (parsed.data.projectWorkers) setProjectWorkers(parsed.data.projectWorkers);
      if (parsed.data.weeklyTimesheets) setWeeklyTimesheets(parsed.data.weeklyTimesheets);
      if (parsed.data.procurements) setProcurements(parsed.data.procurements);
      if (parsed.data.fuelLogs) setFuelLogs(parsed.data.fuelLogs);
      if (parsed.data.officeExpenses) setOfficeExpenses(parsed.data.officeExpenses);
      if (parsed.data.vendors) setVendors(parsed.data.vendors);
      if (parsed.data.vendorTransactions) setVendorTransactions(parsed.data.vendorTransactions);
      if (parsed.data.rentalMachinery) setRentalMachinery(parsed.data.rentalMachinery);
      if (parsed.data.rentalWorkLogs) setRentalWorkLogs(parsed.data.rentalWorkLogs);
      if (parsed.data.rentalPayments) setRentalPayments(parsed.data.rentalPayments);
      if (parsed.data.auditLogs) setAuditLogs(parsed.data.auditLogs);

      addAuditLog(
        'استرجاع نسخة احتياطية سابقة للنظام',
        'security',
        'warning',
        `تمت استعادة بيانات النظام من نسخة مؤرخة بـ [${parsed.exportedAt}] بواسطة [${currentUser.nameAr}].`
      );

      showNotification('تمت استعادة البيانات بنجاح', 'تم استرجاع كافة السجلات المالية والتشغيلية المعتمدة.');
      return { success: true, message: 'تم استرجاع النسخة الاحتياطية بنجاح.' };
    } catch {
      return { success: false, message: 'فشل في قراءة ملف JSON للنسخة الاحتياطية.' };
    }
  };

  const resetToFactorySettings = () => {
    setProjects(INITIAL_PROJECTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSiteLogs(INITIAL_SITE_LOGS);
    setOpeningBalance(0);
    setInvoices(INITIAL_INVOICES);
    setCashVouchers(INITIAL_CASH_VOUCHERS);
    setDailyRegisters(INITIAL_SAFE_REGISTERS);
    setEmployees(INITIAL_EMPLOYEES);
    setSalarySlips(INITIAL_SALARY_SLIPS);
    setProjectWorkers(INITIAL_PROJECT_WORKERS);
    setWeeklyTimesheets(INITIAL_WEEKLY_TIMESHEETS);
    setProcurements(INITIAL_DAILY_PROCUREMENTS);
    setFuelLogs(INITIAL_FUEL_LOGS);
    setOfficeExpenses(INITIAL_OFFICE_EXPENSES);
    setVendors(INITIAL_VENDORS);
    setVendorTransactions(INITIAL_VENDOR_TRANSACTIONS);
    setRentalMachinery(INITIAL_RENTAL_MACHINERY);
    setRentalWorkLogs(INITIAL_RENTAL_WORK_LOGS);
    setRentalPayments(INITIAL_RENTAL_PAYMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);

    addAuditLog(
      'تصفير وإعادة تعيين بيانات النظام إلى الوضع النظيف',
      'security',
      'critical',
      `تم تصفير النظام بالكامل بواسطة [${currentUser.nameAr}].`
    );
    showNotification('تم التصفير بنجاح', 'تم تصفير النظام وتهيئته لبدء التشغيل الفعلي.');
  };

  return (
    <ErpContext.Provider
      value={{
        cloudSyncStatus,
        isAuthenticated,
        loginWithPin,
        logout,
        switchRoleWithPin,
        updateRolePin,
        userProfiles,
        activeUserRoles,
        updateUserProfile,
        deleteUserAccount,
        restoreUserAccount,
        currentRole,
        roleConfig,
        currentUser,
        setRole,
        currentTab,
        setCurrentTab,
        sidebarCollapsed,
        toggleSidebar,
        license,
        verifyLicense,
        resetDefaultLicense,
        auditLogs,
        addAuditLog,
        projects,
        addProject,
        deleteProject,
        transactions,
        siteLogs,
        addTransaction,
        deleteTransaction,
        approveTransaction,
        addSiteLog,
        // Treasury / Safe
        cashVouchers,
        dailyRegisters,
        openingBalance,
        totalCashIn,
        totalCashOut,
        liveSafeBalance,
        addCashVoucher,
        deleteCashVoucher,
        closeDailyRegister,
        // Invoices
        invoices,
        addInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        selectedInvoiceForPrint,
        setSelectedInvoiceForPrint,
        companyBillingInfo: COMPANY_BILLING_INFO,
        // Task 5: Payroll & Workforce
        employees,
        salarySlips,
        projectWorkers,
        weeklyTimesheets,
        addEmployee,
        addSalarySlip,
        approveAndDisburseSalary,
        addProjectWorker,
        updateWorkerAttendance,
        updateWorkerOvertimeAndAdvances,
        approveAndDisburseWeeklyTimesheet,
        // Task 6: Operational Logistics & Expenses
        procurements,
        fuelLogs,
        officeExpenses,
        addProcurementItem,
        addFuelLog,
        addOfficeExpense,
        // Task 7: Subcontractors, Vendors & Rental Fleet
        vendors,
        vendorTransactions,
        addVendor,
        addVendorBill,
        payVendor,
        rentalMachinery,
        rentalWorkLogs,
        rentalPayments,
        addRentalMachinery,
        logRentalWork,
        payRentalMachinery,
        // Task 8: Backup & System Master
        exportSystemBackup,
        downloadBackupFile,
        restoreSystemBackup,
        resetToFactorySettings,
        hasPermission,
        notificationMessage,
        showNotification,
        closeNotification,
        isRoleModalOpen,
        setIsRoleModalOpen
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};
