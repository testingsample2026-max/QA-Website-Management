/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true
}) => {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10"
          >
            {/* Header / Icon */}
            <div className="p-6 pb-4 flex gap-4 items-start">
              <div className={`p-3 rounded-xl ${isDestructive ? 'bg-red-50 dark:bg-red-950/30 text-red-600' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-sans">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-white font-medium text-sm rounded-lg shadow-sm transition-all active:scale-[0.98] ${
                  isDestructive
                    ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-200 dark:hover:shadow-none'
                    : 'bg-amber-600 hover:bg-amber-700 hover:shadow-amber-200 dark:hover:shadow-none'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
