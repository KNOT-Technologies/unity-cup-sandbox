import React, { Component, type ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    showToast: boolean;
}

class ApiErrorBoundary extends Component<Props, State> {
    private toastTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            showToast: false,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            showToast: true,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("API Error caught by boundary:", error, errorInfo);

        // Show toast for API errors
        if (error.name === "APIError") {
            this.showToast();
        }
    }

    showToast = () => {
        this.setState({ showToast: true });

        // Auto-hide toast after 5 seconds
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        this.toastTimer = setTimeout(() => {
            this.setState({ showToast: false });
        }, 5000);
    };

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            showToast: false,
        });
    };

    dismissToast = () => {
        this.setState({ showToast: false });
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }
    };

    componentWillUnmount() {
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }
    }

    render() {
        const { hasError, error, showToast } = this.state;
        const { children } = this.props;

        if (hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/20 backdrop-blur-xl rounded-xl p-8 max-w-md w-full
              border border-red-500/20 text-center"
                    >
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">
                                Something went wrong
                            </h2>
                            <p className="text-white/60 text-sm">
                                {error?.message ||
                                    "An unexpected error occurred"}
                            </p>
                        </div>

                        <motion.button
                            onClick={this.handleRetry}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-gradient-to-br from-amber-500 to-amber-400 text-gray-900
                px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2
                hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </motion.button>
                    </motion.div>
                </div>
            );
        }

        return (
            <>
                {children}
                {/* Toast Notification */}
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        className="fixed top-4 right-4 z-50 bg-red-500/90 backdrop-blur-xl
              text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm"
                    >
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">API Error</p>
                            <p className="text-xs opacity-90">
                                {error?.message || "Something went wrong"}
                            </p>
                        </div>
                        <button
                            onClick={this.dismissToast}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            ×
                        </button>
                    </motion.div>
                )}
            </>
        );
    }
}

export default ApiErrorBoundary;
