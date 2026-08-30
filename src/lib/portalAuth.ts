
export const FOUNDER_EMAILS = ['pranjalagrawal576@gmail.com', 'hr.conceptmadeeasyclasses@gmail.com'];
export const isFounderEmail = (email?: string | null) => FOUNDER_EMAILS.includes((email || '').trim().toLowerCase());
import { db, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from './firebase';
import { runTransaction } from 'firebase/firestore';

// Helper to translate roles into codes
export function getRoleCode(role: string): string {
  const r = role.toLowerCase();
  if (r.includes('student') || r === 's') return 's';
  if (r.includes('teacher') || r === 't') return 't';
  if (r.includes('editor') || r === 'e') return 'E';
  if (r.includes('backend') || r === 'b') return 'B';
  if (r.includes('accountant') || r === 'a') return 'A';
  if (r.includes('hr') || r === 'hr') return 'HR';
  return 's';
}

// Function to increment global login counter by 1
export async function incrementLoginCounter(): Promise<number> {
  const counterRef = doc(db, 'counters', 'rollNumber');
  try {
    const newValue = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { currentValue: 2 }); // starts at 1, incremented to 2 on first login
        return 2;
      }
      const data = counterDoc.data();
      const nextVal = (data.currentValue || 1) + 1;
      transaction.update(counterRef, { currentValue: nextVal });
      return nextVal;
    });
    return newValue;
  } catch (error) {
    console.error('Error incrementing login counter:', error);
    // Fallback: use timestamp or local counter
    const localVal = parseInt(localStorage.getItem('cme_local_counter') || '1') + 1;
    localStorage.setItem('cme_local_counter', localVal.toString());
    return localVal;
  }
}

// Function to get current counter value
export async function getCurrentCounter(): Promise<number> {
  const counterRef = doc(db, 'counters', 'rollNumber');
  try {
    const counterDoc = await getDoc(counterRef);
    if (counterDoc.exists()) {
      return counterDoc.data().currentValue || 1;
    } else {
      await setDoc(counterRef, { currentValue: 1 });
      return 1;
    }
  } catch (e) {
    console.error(e);
    return parseInt(localStorage.getItem('cme_local_counter') || '1');
  }
}

// Format roll number
export function formatRollNumber(role: string, count: number): string {
  const currentYear = new Date().getFullYear();
  const code = getRoleCode(role);
  const padded = String(count).padStart(6, '0');
  return `${currentYear}PRO-${code}-${padded}`;
}
