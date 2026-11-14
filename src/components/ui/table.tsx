import React, {
  type HTMLAttributes,
  type TableHTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
  forwardRef,
} from "react";

export const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div className="relative w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table
          ref={ref}
          className={`w-full caption-bottom text-left text-sm text-slate-700 ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);
Table.displayName = "Table";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <thead ref={ref} className={`bg-slate-50 border-b border-slate-200 ${className}`} {...props}>
      {children}
    </thead>
  );
});
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <tbody ref={ref} className={`divide-y divide-slate-100 ${className}`} {...props}>
      {children}
    </tbody>
  );
});
TableBody.displayName = "TableBody";

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <tfoot
      ref={ref}
      className={`border-t border-slate-200 bg-slate-50/50 font-medium ${className}`}
      {...props}
    >
      {children}
    </tfoot>
  );
});
TableFooter.displayName = "TableFooter";

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={`transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-slate-100 ${className}`}
        {...props}
      >
        {children}
      </tr>
    );
  }
);
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`h-10 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 align-middle ${className}`}
        {...props}
      >
        {children}
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <td ref={ref} className={`p-4 align-middle text-slate-700 ${className}`} {...props}>
        {children}
      </td>
    );
  }
);
TableCell.displayName = "TableCell";

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <caption ref={ref} className={`mt-4 text-xs text-slate-500 ${className}`} {...props}>
      {children}
    </caption>
  );
});
TableCaption.displayName = "TableCaption";
