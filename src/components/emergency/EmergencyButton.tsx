import { AlertCircle } from 'lucide-react';

export function EmergencyButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 transition-all animate-pulse"
      style={{ animationDuration: '3s' }}
    >
      <AlertCircle className="w-5 h-5" />
      <span className="hidden sm:inline">SOS</span>
    </button>
  );
}
