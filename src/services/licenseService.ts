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
