import React from "react";
import clsx from "clsx";

interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg m-3">
        <h2 className="text-lg font-bold mb-4 text-primary">
          {title}
        </h2>
        <div className="text-primary">{message}</div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onCancel}
            className="font-medium text-sm bg-neutral-200 text-primary  px-4 py-1.5 rounded hover:bgneutral-300"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={clsx(
              "px-4 py-1.5 text-sm rounded font-medium",
              destructive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-slate-800 text-white"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
