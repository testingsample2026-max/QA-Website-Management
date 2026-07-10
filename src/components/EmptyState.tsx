/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Database } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  id
}) => {
  return (
    <div
      id={id || `empty-state-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xs transition-all duration-300 max-w-lg mx-auto my-6"
    >
      <div className="p-4 bg-slate-50 dark:bg-slate-950 text-slate-450 dark:text-slate-500 rounded-full mb-4 animate-pulse">
        {icon || <Database className="w-10 h-10" />}
      </div>
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-250 mb-1 font-sans">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
