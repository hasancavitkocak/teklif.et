import { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ModalType = 'success' | 'error' | 'warning' | 'confirm';

type ModalContextType = {
  showModal: (type: ModalType, title: string, message: string, onConfirm?: () => void) => void;
  showToast: (type: Exclude<ModalType, 'confirm'>, message: string) => void;
  hideModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<{
    show: boolean;
    type: ModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  const [toast, setToast] = useState<{
    show: boolean;
    type: Exclude<ModalType, 'confirm'>;
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  const showModal = (type: ModalType, title: string, message: string, onConfirm?: () => void) => {
    setModal({ show: true, type, title, message, onConfirm });
  };

  const hideModal = () => {
    setModal({ ...modal, show: false });
  };

  const showToast = (type: Exclude<ModalType, 'confirm'>, message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ ...toast, show: false });
    }, 3000);
  };

  const getIcon = (type: ModalType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'warning':
      case 'confirm':
        return <AlertCircle className="w-16 h-16 text-amber-500" />;
    }
  };

  const getColors = (type: ModalType) => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-emerald-500';
      case 'error':
        return 'from-red-500 to-rose-500';
      case 'warning':
      case 'confirm':
        return 'from-amber-500 to-orange-500';
    }
  };

  return (
    <ModalContext.Provider value={{ showModal, showToast, hideModal }}>
      {children}

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in duration-200">
            <div className={`bg-gradient-to-r ${getColors(modal.type)} p-6 rounded-t-3xl`}>
              <div className="flex justify-end">
                <button
                  onClick={hideModal}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                {getIcon(modal.type)}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {modal.title}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {modal.message}
              </p>

              <div className="flex gap-3">
                {modal.type === 'confirm' ? (
                  <>
                    <button
                      onClick={hideModal}
                      className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      İptal
                    </button>
                    <button
                      onClick={() => {
                        modal.onConfirm?.();
                        hideModal();
                      }}
                      className={`flex-1 py-3 bg-gradient-to-r ${getColors(modal.type)} text-white rounded-xl font-semibold hover:shadow-lg transition-all`}
                    >
                      Onayla
                    </button>
                  </>
                ) : (
                  <button
                    onClick={hideModal}
                    className={`w-full py-3 bg-gradient-to-r ${getColors(modal.type)} text-white rounded-xl font-semibold hover:shadow-lg transition-all`}
                  >
                    Tamam
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top duration-300">
          <div className={`bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 min-w-[300px] border-l-4 ${
            toast.type === 'success' ? 'border-green-500' :
            toast.type === 'error' ? 'border-red-500' :
            'border-amber-500'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />}
            <p className="text-gray-800 font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
