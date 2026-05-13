export interface ParsedPagedQuery {
  page: number;
  pageSize: number;
  search?: string;
}

function readParam(
  query: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = query[key];
  return Array.isArray(v) ? v[0] : v;
}

export function parsePagedQuery(
  query: Record<string, string | string[] | undefined>
): ParsedPagedQuery {
  const page = Math.max(1, parseInt(readParam(query, 'page') ?? '1', 10) || 1);
  const sizeRaw =
    parseInt(readParam(query, 'page_size') ?? readParam(query, 'pageSize') ?? '10', 10) || 10;
  const pageSize = Math.min(100, Math.max(1, sizeRaw));
  const s = readParam(query, 'search')?.trim();
  return { page, pageSize, search: s && s.length > 0 ? s : undefined };
}

export interface ParsedBookListQuery extends ParsedPagedQuery {
  availableOnly: boolean;
}

export function parseBookListQuery(
  query: Record<string, string | string[] | undefined>
): ParsedBookListQuery {
  const base = parsePagedQuery(query);
  const raw = readParam(query, 'available_only');
  const availableOnly = raw === '1' || raw === 'true';
  return { ...base, availableOnly };
}
