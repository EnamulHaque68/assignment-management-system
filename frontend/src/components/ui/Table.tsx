import React, { TableHTMLAttributes, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

export const Table: React.FC<TableHTMLAttributes<HTMLTableElement>> = ({ className = '', children, ...props }) => (
  <div className="table-container">
    <table className={`custom-table ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const Thead: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', children, ...props }) => (
  <thead className={className} {...props}>
    {children}
  </thead>
);

export const Tbody: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', children, ...props }) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
);

export const Tr: React.FC<HTMLAttributes<HTMLTableRowElement>> = ({ className = '', children, ...props }) => (
  <tr className={className} {...props}>
    {children}
  </tr>
);

export const Th: React.FC<ThHTMLAttributes<HTMLTableCellElement>> = ({ className = '', children, ...props }) => (
  <th className={className} {...props}>
    {children}
  </th>
);

export const Td: React.FC<TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', children, ...props }) => (
  <td className={className} {...props}>
    {children}
  </td>
);

export interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => ReactNode;
    align?: 'left' | 'center' | 'right';
  }[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  keyExtractor: (item: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyTitle = 'No data found',
  emptyDescription = 'There are currently no records to display.',
  onEmptyAction,
  emptyActionLabel,
  keyExtractor,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="table-container p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {columns.map((_, j) => (
              <Skeleton key={j} className="h-6 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-container p-8">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  return (
    <Table>
      <Thead>
        <Tr>
          {columns.map((col, idx) => (
            <Th
              key={idx}
              style={{
                textAlign: col.align || 'left',
              }}
            >
              {col.header}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((item) => (
          <Tr key={keyExtractor(item)}>
            {columns.map((col, idx) => (
              <Td
                key={idx}
                style={{
                  textAlign: col.align || 'left',
                }}
              >
                {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] ?? '') : ''}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
