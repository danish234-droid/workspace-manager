import { format, formatDistanceToNow, isAfter, isBefore, isToday, isTomorrow, isYesterday, parseISO, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy h:mm a');
}

export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

export const formatRelativeTime = formatRelative;

export function isOverdue(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  return isBefore(parseISO(dateStr), new Date()) && !isToday(parseISO(dateStr));
}

export function isDueSoon(dateStr: string | undefined, withinDays = 3): boolean {
  if (!dateStr) return false;
  const date = parseISO(dateStr);
  const now = new Date();
  const diff = differenceInDays(date, now);
  return diff >= 0 && diff <= withinDays;
}

export function getMonthDays(year: number, month: number) {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  const days = eachDayOfInterval({ start, end });
  const startDay = getDay(start);
  return { days, startDay };
}

export function nowISO(): string {
  return new Date().toISOString();
}

export { addMonths, subMonths, format, parseISO, isAfter, isBefore, isToday };
