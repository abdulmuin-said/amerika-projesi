import React from "react";

export default function NotificationCard({
  message,
  isVisible,
  onClose,
  action
}: {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  action?: { label: string; onClick: () => void };
}) {
  if (!isVisible) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-white border shadow-lg p-4 rounded-lg z-50 flex flex-col gap-2">
      <div className="flex justify-between items-center gap-4">
        <span>{message}</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
      </div>
      {action && (
        <button onClick={action.onClick} className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700">
          {action.label}
        </button>
      )}
    </div>
  );
}
