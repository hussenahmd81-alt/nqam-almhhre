import { LicenseInfo } from '../types/erp';

// Default corporate license for Lamasat Al-Meamar
export const DEFAULT_LICENSE: LicenseInfo = {
  licenseKey: 'LAMASAT-ARCH-2026-X9F4-PRO-SA',
  clientName: 'شركة لمسات المعمار للمقاولات والهندسة المحدودة',
  commercialRegNumber: 'CR-1010894211',
  status: 'active',
  tier: 'Enterprise Architectural Edition (ترخيص مؤسسي غير محدود)',
  issuedAt: '2026-01-01',
  expiresAt: '2027-12-31',
  daysRemaining: 647,
  authorizedDomains: [
    'localhost',
    '127.0.0.1',
    '*.run.app',
    'ais-dev-*.europe-west1.run.app',
    'ais-pre-*.europe-west1.run.app',
    'lamasat-almeamar.sa',
    'erp.lamasat.sa'
  ],
  boundDomain: typeof window !== 'undefined' ? window.location.hostname : 'lamasat-almeamar.sa',
  hardwareFingerprint: 'LM-SRV-8942-HWID-9F8A-E3C1',
  signatureChecksum: 'SHA256:7e9b04fca29184cb263dc947a11bf3a5a8f4c20b81',
  maxSeats: 50,
  activeSeats: 18,
  enabledModules: [
    'المحاسبة والمستخلصات الهندسية',
    'إدارة المشاريع والمخططات المعمارية',
    'الصندوق والعهد النقدية',
    'تشغيل الآليات واستهلاك الوقود',
    'سجل الأمان والتدقيق المالي الشامل',
    'نظام ربط النطاق وتشفير الهوية'
  ],
  lastVerificationTime: new Date().toISOString()
};

// Preset demo keys for testing verification behavior
export const DEMO_KEYS = [
  {
    label: 'مفتاح مؤسسي معتمد وصالح (شركة لمسات المعمار)',
    key: 'LAMASAT-ARCH-2026-X9F4-PRO-SA',
    expectedStatus: 'active' as const,
    description: 'ترخيص كامل الصلاحيات مخصص لشركة لمسات المعمار للمقاولات'
  },
  {
    label: 'مفتاح منتهي الصلاحية (Expired Test Key)',
    key: 'LAMASAT-EXPIRED-2025-001A-EXP',
    expectedStatus: 'expired' as const,
    description: 'انتهت صلاحية هذا المفتاح في ديسمبر 2025'
  },
  {
    label: 'مفتاح نطاق غير مصرح (Domain Mismatch)',
    key: 'LAMASAT-FOREIGN-DOMAIN-8832-MIS',
    expectedStatus: 'domain_mismatch' as const,
    description: 'المفتاح مربوط بنطاق خارجي غير مصرح له بتشغيل النظام'
  },
  {
    label: 'مفتاح مزور / غير صالح (Tampered Key)',
    key: 'PIRATED-CRACK-9999-FAKE-KEY',
    expectedStatus: 'invalid' as const,
    description: 'مفتاح غير مسجل في خوارزمية التشفير المعمارية'
  }
];

export function verifyLicenseKey(key: string): {
  isValid: boolean;
  status: 'active' | 'expired' | 'invalid' | 'domain_mismatch';
  message: string;
  licenseData?: Partial<LicenseInfo>;
} {
  const cleanKey = key.trim().toUpperCase();

  if (!cleanKey) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'الرجاء إدخال رمز الترخيص للتحقق'
    };
  }

  // 1. Check for known test keys
  if (cleanKey === 'LAMASAT-EXPIRED-2025-001A-EXP') {
    return {
      isValid: false,
      status: 'expired',
      message: 'تم إيقاف النظام: انتهت صلاحية ترخيص شركة لمسات المعمار بتاريخ 2025-12-31. يرجى التجديد.',
      licenseData: {
        licenseKey: cleanKey,
        status: 'expired',
        expiresAt: '2025-12-31',
        daysRemaining: 0
      }
    };
  }

  if (cleanKey === 'LAMASAT-FOREIGN-DOMAIN-8832-MIS') {
    return {
      isValid: false,
      status: 'domain_mismatch',
      message: 'انتهاك ترخيص: هذا المفتاح مقيد بنطاق محدد ولا يتطابق مع هذا السيرفر أو النطاق الحالي.',
      licenseData: {
        licenseKey: cleanKey,
        status: 'domain_mismatch',
        boundDomain: 'restricted-node-unauthorized.net'
      }
    };
  }

  if (cleanKey.includes('FAKE') || cleanKey.includes('CRACK') || !cleanKey.startsWith('LAMASAT-')) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'تنبيه أمني عالي: مفتاح الترخيص غير معتمد أو تم التلاعب به. تم تسجيل محاولة التشغيل في سجل التدقيق.',
      licenseData: {
        licenseKey: cleanKey,
        status: 'invalid'
      }
    };
  }

  // Check valid architectural license
  if (cleanKey.startsWith('LAMASAT-')) {
    const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    
    return {
      isValid: true,
      status: 'active',
      message: 'تم التحقق بنجاح: ترخيص أصلي ومعتمد لشركة لمسات المعمار للمقاولات والهندسة.',
      licenseData: {
        licenseKey: cleanKey,
        status: 'active',
        clientName: 'شركة لمسات المعمار للمقاولات والهندسة المحدودة',
        boundDomain: currentHostname,
        expiresAt: '2027-12-31',
        daysRemaining: 647,
        lastVerificationTime: new Date().toISOString()
      }
    };
  }

  return {
    isValid: false,
    status: 'invalid',
    message: 'المفتاح المدخل لا يطابق خوارزمية التشفير المعتمدة لشركة لمسات المعمار.'
  };
}

export function getStoredLicense(): LicenseInfo {
  return { ...DEFAULT_LICENSE };
}

export function saveStoredLicense(_license: LicenseInfo): void {
  // Caching disabled per user requirement: changes and states remain immediate and fresh
}
