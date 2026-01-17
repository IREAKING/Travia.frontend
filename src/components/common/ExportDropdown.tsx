import { useState } from 'react';

interface ExportDropdownProps {
  onExportCsv: () => void | Promise<void>;
  onExportXlsx: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export const ExportDropdown = ({
  onExportCsv,
  onExportXlsx,
  disabled = false,
  className = '',
  label = 'Xuất file',
}: ExportDropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`relative inline-flex ${className}`}
      tabIndex={-1}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-white/20 text-white/90 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {label}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-10">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onExportCsv();
            }}
            className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onExportXlsx();
            }}
            className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5"
          >
            XLSX
          </button>
        </div>
      )}
    </div>
  );
};
