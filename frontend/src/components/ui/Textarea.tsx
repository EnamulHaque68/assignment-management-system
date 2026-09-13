import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, showCount = false, value, className = '', id, required, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const length = typeof value === 'string' ? value.length : 0;

    return (
      <div className="input-group">
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={textareaId} className="input-label">
              {label} {required && <span className="text-rose-400">*</span>}
            </label>
          )}
          {showCount && (
            <span className="text-xs text-slate-400 font-mono">
              {length} {props.maxLength ? `/ ${props.maxLength}` : 'chars'}
            </span>
          )}
        </div>
        <textarea
          id={textareaId}
          ref={ref}
          value={value}
          className={`textarea-field ${
            error ? '!border-rose-500 !focus:border-rose-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-400 mt-1">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
