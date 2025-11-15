export type ClassValue =
  | string
  | number
  | null
  | undefined
  | boolean
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

function normalizeClassValue(value: ClassValue): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => normalizeClassValue(entry));
  }

  return Object.entries(value)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([name]) => name);
}

export function cn(...inputs: ClassValue[]): string {
  return inputs.flatMap((value) => normalizeClassValue(value)).join(' ');
}

type DateInput = Date | string | number;

function toDate(input: DateInput): Date {
  if (input instanceof Date) {
    return input;
  }

  if (typeof input === 'number') {
    return new Date(input);
  }

  return new Date(input);
}

export function formatCurrency(
  amountInMinor: number,
  currency: string = 'GBP',
  locale: string = 'en-GB',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountInMinor / 100);
}

export function formatDateLabel(input: DateInput, locale: string = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(toDate(input));
}

export function formatTimeRange(
  start: DateInput,
  end: DateInput,
  locale: string = 'en-GB',
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${formatter.format(toDate(start))} – ${formatter.format(toDate(end))}`;
}
