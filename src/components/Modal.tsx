"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import React, { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  height?: "auto" | "full";
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  className = "",
  overlayClassName = "",
  height = "auto",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);



  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex",
        height === "full"
          ? "items-start justify-center pt-3"
          : "items-center justify-center p-4",
        "bg-black/60",
        overlayClassName
      )}

    >
      <div
        ref={modalRef}
        className={clsx(
          "bg-white",
          "rounded-2xl shadow-2xl w-full",
          sizeClasses,
          height === "full"
            ? "h-[calc(100vh-0.75rem)] overflow-hidden"
            : "max-h-[90vh] overflow-y-auto",
          "transform transition-all duration-300 ease-out",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white  z-10">
            <h2 className="text-xl font-semibold text-primary">
              {title}
            </h2>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100  text-neutral-500 hover:text-neutral-700  transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Body */}
          <div
            className={clsx(
              "",
              height === "full" && "overflow-y-auto flex-1"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
