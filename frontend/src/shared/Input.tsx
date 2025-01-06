import { startCase } from "lodash";
import React, { useState, ChangeEvent, CSSProperties, forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  style?: CSSProperties;
  row?: number;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  type?: string;
  classProp?: string;
  outerClassProp?: string;
  errorClassProp?: string;
}
// TextArea Component
export const TextArea = forwardRef<
  HTMLTextAreaElement,
  Omit<InputProps, "onChange"> & {
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  }
>(
  (
    {
      name,
      required,
      value,
      onChange,
      row = 4,
      placeholder,
      disabled = false,
      error,
      helperText,
      classProp,
      outerClassProp,
      errorClassProp,
      label,
    },
    ref
  ) => {
    return (
      <div className={`relative ${outerClassProp}`}>
        <label htmlFor={name} className="block text-base rounded-full font-medium mb-2">
          {label ? label || startCase(placeholder) : startCase(name)}
        </label>
        <textarea
          placeholder={placeholder}
          ref={ref}
          id={name}
          name={name}
          rows={row}
          required={required}
          disabled={disabled}
          value={value}
          onChange={onChange} // Now specific to HTMLTextAreaElement
          className={`w-full pl-2 py-2 outline outline-2 outline-custom-less-gray text-base rounded ${classProp} ${
            error ? "outline-custom-red" : ""
          } ${error ? "focus:ring-custom-red" : "focus:ring-custom-less-gray"}`}
        />
        {helperText && (
          <p
            className={`ml-2 mt-[2px] bg-custom-white text-xs w-auto whitespace-nowrap ${
              error ? "text-custom-red" : "text-grey"
            } ${errorClassProp}`}
          >
            {helperText.replace(/_/g, " ")}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea"; // Optional: Set display name for better debugging
