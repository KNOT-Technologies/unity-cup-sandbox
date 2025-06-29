import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const BusinessLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email.trim(),
                formData.password
            );
            const idToken = await userCredential.user.getIdToken();

            // Persist token for authenticated requests
            localStorage.setItem("authToken", idToken);

            // Optional: keep legacy flag so existing route guards continue to work
            localStorage.setItem("businessLoggedIn", "true");

            navigate("/business");
        } catch (err: unknown) {
            console.error("Login error:", err);
            // Firebase error codes
            const msg =
                err && typeof err === "object" && "code" in err
                    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      (err.code as string)
                    : "Authentication failed";
            setError(msg.replace("auth/", "").replace(/-/g, " "));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-16">
            <div className="max-w-md mx-auto px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-medium mb-3">
                        Business Portal Login
                    </h1>
                    <p className="text-gray-400">
                        Access your corporate account to manage group bookings
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-700/20 
            hover:border-amber-500/20 transition-all duration-500 
            hover:shadow-2xl hover:shadow-amber-500/5
            relative before:absolute before:inset-0 
            before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent 
            before:rounded-2xl before:opacity-0 hover:before:opacity-100 
            before:transition-opacity before:duration-500 before:pointer-events-none
            p-6"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-white/60 mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full bg-gray-800/30 border border-gray-700/30 rounded-xl px-4 py-3
                  text-white placeholder-white/40 focus:outline-none focus:ring-2 
                  focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300"
                                placeholder="your@company.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-white/60 mb-2"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full bg-gray-800/30 border border-gray-700/30 rounded-xl px-4 py-3
                  text-white placeholder-white/40 focus:outline-none focus:ring-2 
                  focus:ring-amber-500/50 focus:border-amber-500/30 transition-all duration-300"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-700/30 bg-gray-800/30 
                    text-amber-500 focus:ring-amber-500/50"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-white/60"
                                >
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a
                                    href="#"
                                    className="font-medium text-amber-400 hover:text-amber-300"
                                >
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-300
                relative overflow-hidden group bg-gradient-to-b from-amber-500 to-amber-600
                hover:to-amber-500 text-black disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>

                        <div className="text-center text-sm text-white/40">
                            Don't have an account?{" "}
                            <a
                                href="#"
                                className="font-medium text-amber-400 hover:text-amber-300"
                            >
                                Contact sales
                            </a>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default BusinessLogin;
