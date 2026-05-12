import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

export async function initRevenueCat(userId: string) {
  if (!Capacitor.isNativePlatform()) return;

  const apiKey = Capacitor.getPlatform() === 'ios'
    ? import.meta.env.VITE_REVENUECAT_IOS_KEY
    : import.meta.env.VITE_REVENUECAT_ANDROID_KEY;

  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({ apiKey, appUserID: userId });
}

export async function checkRevenueCatPremium(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active['pro'] !== 'undefined';
  } catch {
    return false;
  }
}

export async function getOfferings() {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { offerings } = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function purchasePackage(packageToPurchase: any) {
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToPurchase });
  return typeof customerInfo.entitlements.active['pro'] !== 'undefined';
}

export async function restorePurchases(): Promise<boolean> {
  const { customerInfo } = await Purchases.restorePurchases();
  return typeof customerInfo.entitlements.active['pro'] !== 'undefined';
}
