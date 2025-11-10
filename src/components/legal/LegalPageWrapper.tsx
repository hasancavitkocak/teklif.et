import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface LegalPageWrapperProps {
  children: ReactNode;
  onBack?: () => void;
}

export default function LegalPageWrapper({ children, onBack }: LegalPageWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {onBack && (
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Geri Dön</span>
            </button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
