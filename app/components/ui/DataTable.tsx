'use client';

import { useState, useMemo, useCallback, ReactNode } from 'react';

/** 欄位定義 */
export interface ColumnDef<T> {
  /** 欄位 ID */
  id: string;
  /** 欄位標題 */
  header: string;
  /** 存取資料的 key 或函數 */
  accessor: keyof T | ((row: T) => ReactNode);
  /** 是否可排序 */
  sortable?: boolean;
  /** 是否可搜尋 */
  searchable?: boolean;
  /** 自訂渲染函數 */
  cell?: (value: unknown, row: T) => ReactNode;
  /** 欄位寬度 */
  width?: string;
  /** 對齊方式 */
  align?: 'left' | 'center' | 'right';
  /** 隱藏欄位（仍可搜尋） */
  hidden?: boolean;
}

/** 排序狀態 */
interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

/** DataTable Props */
interface DataTableProps<T> {
  /** 資料陣列 */
  data: T[];
  /** 欄位定義 */
  columns: ColumnDef<T>[];
  /** 載入中狀態 */
  loading?: boolean;
  /** 空狀態顯示 */
  emptyState?: ReactNode;
  /** 行點擊回調 */
  onRowClick?: (row: T) => void;
  /** 是否顯示搜尋框 */
  searchable?: boolean;
  /** 搜尋框 placeholder */
  searchPlaceholder?: string;
  /** 每頁筆數選項 */
  pageSizeOptions?: number[];
  /** 預設每頁筆數 */
  defaultPageSize?: number;
  /** 是否顯示分頁 */
  showPagination?: boolean;
  /** 取得 row key 的函數 */
  getRowKey: (row: T) => string;
  /** 額外的表格 className */
  className?: string;
  /** 緊湊模式 */
  compact?: boolean;
  /** 斑馬紋 */
  striped?: boolean;
}

/**
 * DataTable - 可重用的資料表格元件
 *
 * 功能：
 * - 排序
 * - 搜尋
 * - 分頁
 * - 自訂欄位渲染
 * - 行點擊事件
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={events}
 *   columns={[
 *     { id: 'title', header: '活動名稱', accessor: 'title', sortable: true },
 *     { id: 'date', header: '日期', accessor: 'date', sortable: true },
 *     { id: 'status', header: '狀態', accessor: 'status', cell: (v) => <Badge>{v}</Badge> },
 *   ]}
 *   getRowKey={(row) => row.id}
 *   onRowClick={(row) => router.push(`/events/${row.id}`)}
 *   searchable
 * />
 * ```
 */
export function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyState,
  onRowClick,
  searchable = false,
  searchPlaceholder = '搜尋...',
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 10,
  showPagination = true,
  getRowKey,
  className = '',
  compact = false,
  striped = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // 取得欄位值
  const getCellValue = useCallback((row: T, column: ColumnDef<T>): unknown => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor];
  }, []);

  // 搜尋過濾
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    const searchLower = searchTerm.toLowerCase();
    const searchableColumns = columns.filter(col => col.searchable !== false);

    return data.filter(row =>
      searchableColumns.some(col => {
        const value = getCellValue(row, col);
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [data, searchTerm, columns, getCellValue]);

  // 排序
  const sortedData = useMemo(() => {
    if (!sortState) return filteredData;

    const column = columns.find(col => col.id === sortState.column);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = getCellValue(a, column);
      const bVal = getCellValue(b, column);

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortState, columns, getCellValue]);

  // 分頁
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, showPagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // 處理排序
  const handleSort = useCallback((columnId: string) => {
    setSortState(prev => {
      if (prev?.column === columnId) {
        return prev.direction === 'asc'
          ? { column: columnId, direction: 'desc' }
          : null;
      }
      return { column: columnId, direction: 'asc' };
    });
  }, []);

  // 重置頁碼當搜尋變化
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const visibleColumns = columns.filter(col => !col.hidden);
  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className={`w-full ${className}`}>
      {/* 搜尋框 */}
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-border rounded-lg bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full">
          {/* 表頭 */}
          <thead className="bg-bg-secondary">
            <tr>
              {visibleColumns.map(column => (
                <th
                  key={column.id}
                  className={`${cellPadding} text-left text-sm font-medium text-text-secondary ${
                    column.sortable ? 'cursor-pointer hover:bg-bg-card select-none' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className={`flex items-center gap-2 ${
                    column.align === 'center' ? 'justify-center' :
                    column.align === 'right' ? 'justify-end' : ''
                  }`}>
                    {column.header}
                    {column.sortable && (
                      <span className="text-text-muted">
                        {sortState?.column === column.id ? (
                          sortState.direction === 'asc' ? '↑' : '↓'
                        ) : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* 表身 */}
          <tbody className="divide-y divide-border">
            {loading ? (
              // 載入中骨架
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {visibleColumns.map(col => (
                    <td key={col.id} className={cellPadding}>
                      <div className="h-5 bg-bg-secondary animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // 空狀態
              <tr>
                <td colSpan={visibleColumns.length} className="px-4 py-12 text-center">
                  {emptyState || (
                    <div className="text-text-muted">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>沒有資料</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              // 資料行
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={getRowKey(row)}
                  className={`
                    ${onRowClick ? 'cursor-pointer hover:bg-bg-secondary' : ''}
                    ${striped && rowIndex % 2 === 1 ? 'bg-bg-secondary/50' : ''}
                    transition-colors
                  `}
                  onClick={() => onRowClick?.(row)}
                >
                  {visibleColumns.map(column => {
                    const value = getCellValue(row, column);
                    const rendered = column.cell ? column.cell(value, row) : String(value ?? '');

                    return (
                      <td
                        key={column.id}
                        className={`${cellPadding} text-sm text-text-primary ${
                          column.align === 'center' ? 'text-center' :
                          column.align === 'right' ? 'text-right' : ''
                        }`}
                      >
                        {rendered}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分頁 */}
      {showPagination && sortedData.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* 資訊 */}
          <div className="text-sm text-text-muted">
            顯示 {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, sortedData.length)} 筆，共 {sortedData.length} 筆
          </div>

          <div className="flex items-center gap-4">
            {/* 每頁筆數 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">每頁</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-border rounded-lg bg-bg-card text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size} 筆</option>
                ))}
              </select>
            </div>

            {/* 頁碼 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="第一頁"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="上一頁"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="px-3 text-sm text-text-primary">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="下一頁"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="最後一頁"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
