const AUTH_MESSAGES: Record<string, string> = {
  'auth/popup-blocked': 'הדפדפן חסם את חלון ההתחברות. אפשרו חלונות קופצים לאתר, או פתחו את הקישור בדפדפן (Chrome/Safari) ולא מתוך אפליקציה אחרת.',
  'auth/popup-closed-by-user': 'חלון ההתחברות נסגר לפני שהושלמה ההתחברות. נסו שוב.',
  'auth/cancelled-popup-request': 'בוטלה בקשת התחברות קודמת. נסו שוב.',
  'auth/unauthorized-domain': 'הכתובת שממנה נכנסתם אינה מאושרת להתחברות. היכנסו דרך https://work-cal-a4d58.web.app',
  'auth/network-request-failed': 'אין חיבור לאינטרנט. בדקו את החיבור ונסו שוב.',
  'auth/operation-not-allowed': 'התחברות עם Google אינה מופעלת בפרויקט. פנו למנהל המערכת.',
  'auth/user-disabled': 'החשבון הזה הושבת. פנו למנהל.',
  'auth/web-storage-unsupported': 'הדפדפן חוסם אחסון מקומי (אולי גלישה פרטית). נסו בדפדפן רגיל.',
}

const FIRESTORE_MESSAGES: Record<string, string> = {
  'permission-denied': 'אין לך הרשאה לפעולה הזו. אם התחברת עכשיו, ייתכן שהחשבון עוד ממתין לאישור מנהל.',
  unavailable: 'אין חיבור לשרת. בדקו את האינטרנט ונסו שוב.',
  'failed-precondition': 'לא ניתן להשלים את הפעולה כרגע. רעננו את הדף ונסו שוב.',
  unauthenticated: 'ההתחברות פגה. התחברו מחדש.',
}

/** Turns any thrown error into a Hebrew message safe to show the user. */
export function errorMessage(err: unknown, fallback = 'משהו נכשל. נסו שוב.'): string {
  const code = (err as { code?: string })?.code
  if (code) {
    if (AUTH_MESSAGES[code]) return AUTH_MESSAGES[code]
    if (FIRESTORE_MESSAGES[code]) return FIRESTORE_MESSAGES[code]
    return `${fallback} (${code})`
  }
  return fallback
}
