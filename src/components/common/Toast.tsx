import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    duration?: number;
    onClose: () => void;
}

const Toast = ({
    message,
    type = "info",
    duration = 3000,
    onClose,
}: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case "error":
                return <AlertCircle className="w-5 h-5 text-red-400" />;
            case "warning":
                return <AlertCircle className="w-5 h-5 text-yellow-400" />;
            default:
                return <AlertCircle className="w-5 h-5 text-blue-400" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case "success":
                return "bg-green-500/10 border-green-500/20 text-green-400";
            case "error":
                return "bg-red-500/10 border-red-500/20 text-red-400";
            case "warning":
                return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
            default:
                return "bg-blue-500/10 border-blue-500/20 text-blue-400";
        }
    };

    return (
        <div
            className={`p-4 rounded-lg border backdrop-blur-xl shadow-lg ${getColors()} min-w-[300px] max-w-md`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {getIcon()}
                    <span className="text-sm font-medium">{message}</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Toast Container Component
interface ToastContainerProps {
    toasts: Array<{
        id: string;
        message: string;
        type?: "success" | "error" | "warning" | "info";
        duration?: number;
    }>;
    onRemoveToast: (id: string) => void;
}

export const ToastContainer = ({
    toasts,
    onRemoveToast,
}: ToastContainerProps) => {
    return (
        <div className="fixed top-28 right-4 md:right-8 z-50 space-y-3 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 300, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 300, scale: 0.9 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="pointer-events-auto"
                    >
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => onRemoveToast(toast.id)}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Toast;
