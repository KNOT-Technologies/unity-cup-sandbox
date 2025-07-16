import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, User, Mail, Phone, Calendar } from "lucide-react";
import { useUserAuth } from "../../hooks/useUserAuth";
import type { UserLoginData, UserRegistrationData } from "../../types/user";

interface UserAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialMode?: "login" | "register";
}

const UserAuthModal: React.FC<UserAuthModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialMode = "login",
}) => {
    const { login, register, isLoading } = useUserAuth();
    const [mode, setMode] = useState<"login" | "register">(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const [loginData, setLoginData] = useState<UserLoginData>({
        email: "",
        password: "",
    });

    const [registerData, setRegisterData] = useState<UserRegistrationData>({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        dateOfBirth: "",
        nationality: "Nigerian",
    });

    const [validationErrors, setValidationErrors] = useState<
        Partial<Record<keyof UserRegistrationData, string>>
    >({});

    const validateRegistration = () => {
        const errors: Partial<Record<keyof UserRegistrationData, string>> = {};

        if (!registerData.fullName.trim()) {
            errors.fullName = "Full name is required";
        }

        if (!registerData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
            errors.email = "Please enter a valid email address";
        }

        if (!registerData.password) {
            errors.password = "Password is required";
        } else if (registerData.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        if (!registerData.phone.trim()) {
            errors.phone = "Phone number is required";
        }

        if (!registerData.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!loginData.email.trim() || !loginData.password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            await login(loginData);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateRegistration()) {
            return;
        }

        try {
            await register(registerData);
            onSuccess();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Registration failed"
            );
        }
    };

    const handleInputChange = (
        field: keyof UserRegistrationData,
        value: string
    ) => {
        setRegisterData((prev) => ({ ...prev, [field]: value }));

        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleClose = () => {
        setError("");
        setValidationErrors({});
        setLoginData({ email: "", password: "" });
        setRegisterData({
            fullName: "",
            email: "",
            password: "",
            phone: "",
            dateOfBirth: "",
            nationality: "Nigerian",
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-black/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
                    >
                        {/* Background Effects */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.95)_100%)]" />
                        <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]" />
                        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]" />

                        {/* Content */}
                        <div className="relative p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-medium text-white">
                                    {mode === "login"
                                        ? "Sign In"
                                        : "Create Account"}
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-gray-400 mb-6">
                                {mode === "login"
                                    ? "Sign in to complete your booking"
                                    : "Create an account to secure your tickets"}
                            </p>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Forms */}
                            {mode === "login" ? (
                                <form
                                    onSubmit={handleLogin}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={loginData.email}
                                                onChange={(e) =>
                                                    setLoginData((prev) => ({
                                                        ...prev,
                                                        email: e.target.value,
                                                    }))
                                                }
                                                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
                                                placeholder="your.email@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={loginData.password}
                                                onChange={(e) =>
                                                    setLoginData((prev) => ({
                                                        ...prev,
                                                        password:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors pr-12"
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-3 px-4 rounded-xl text-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                            isLoading
                                                ? "bg-gray-600 cursor-not-allowed text-white/60"
                                                : "bg-white text-black hover:bg-gray-100"
                                        }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Signing In...
                                            </>
                                        ) : (
                                            "Sign In"
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form
                                    onSubmit={handleRegister}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={registerData.fullName}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "fullName",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full pl-12 pr-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors ${
                                                    validationErrors.fullName
                                                        ? "border-red-500"
                                                        : "border-gray-600"
                                                }`}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        {validationErrors.fullName && (
                                            <p className="text-red-400 text-sm mt-1">
                                                {validationErrors.fullName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={registerData.email}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full pl-12 pr-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors ${
                                                    validationErrors.email
                                                        ? "border-red-500"
                                                        : "border-gray-600"
                                                }`}
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                        {validationErrors.email && (
                                            <p className="text-red-400 text-sm mt-1">
                                                {validationErrors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={registerData.phone}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "phone",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full pl-12 pr-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors ${
                                                    validationErrors.phone
                                                        ? "border-red-500"
                                                        : "border-gray-600"
                                                }`}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                        {validationErrors.phone && (
                                            <p className="text-red-400 text-sm mt-1">
                                                {validationErrors.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Date of Birth
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={registerData.dateOfBirth}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "dateOfBirth",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full pl-12 pr-4 py-3 bg-gray-800 border rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors ${
                                                    validationErrors.dateOfBirth
                                                        ? "border-red-500"
                                                        : "border-gray-600"
                                                }`}
                                            />
                                        </div>
                                        {validationErrors.dateOfBirth && (
                                            <p className="text-red-400 text-sm mt-1">
                                                {validationErrors.dateOfBirth}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={registerData.password}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "password",
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors pr-12 ${
                                                    validationErrors.password
                                                        ? "border-red-500"
                                                        : "border-gray-600"
                                                }`}
                                                placeholder="Create a password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                        {validationErrors.password && (
                                            <p className="text-red-400 text-sm mt-1">
                                                {validationErrors.password}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-3 px-4 rounded-xl text-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                            isLoading
                                                ? "bg-gray-600 cursor-not-allowed text-white/60"
                                                : "bg-white text-black hover:bg-gray-100"
                                        }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Creating Account...
                                            </>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Mode Toggle */}
                            <div className="mt-6 text-center">
                                <p className="text-gray-400">
                                    {mode === "login"
                                        ? "Don't have an account?"
                                        : "Already have an account?"}{" "}
                                    <button
                                        onClick={() =>
                                            setMode(
                                                mode === "login"
                                                    ? "register"
                                                    : "login"
                                            )
                                        }
                                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                    >
                                        {mode === "login"
                                            ? "Create one"
                                            : "Sign in"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserAuthModal;
