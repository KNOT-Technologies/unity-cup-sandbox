import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type {
    User,
    AuthState,
    UserLoginData,
    UserRegistrationData,
} from "../types/user";

interface UserAuthContextType extends AuthState {
    login: (credentials: UserLoginData) => Promise<void>;
    register: (userData: UserRegistrationData) => Promise<void>;
    logout: () => void;
    updateProfile: (userData: Partial<User>) => Promise<void>;
}

export const UserAuthContext = createContext<UserAuthContextType | undefined>(
    undefined
);

interface UserAuthProviderProps {
    children: ReactNode;
}

export const UserAuthProvider: React.FC<UserAuthProviderProps> = ({
    children,
}) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Mock API function - replace with actual API calls
    const mockApiCall = async (
        url: string,
        options: RequestInit
    ): Promise<{ user: User; token: string }> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const body = options.body
                    ? JSON.parse(options.body as string)
                    : {};

                if (url.includes("/login")) {
                    // Mock login validation
                    if (
                        body.email === "ahmed@knottech.ai" &&
                        body.password === "123456"
                    ) {
                        resolve({
                            user: {
                                id: "1",
                                fullName: "Ahmed Abdallah",
                                email: "ahmed@knottech.ai",
                                phone: "+1234567890",
                                dateOfBirth: "1997-01-01",
                                nationality: "Nigerian",
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            },
                            token: "mock-jwt-token",
                        });
                    } else {
                        reject(new Error("Invalid credentials"));
                    }
                } else if (url.includes("/register")) {
                    // Mock registration
                    resolve({
                        user: {
                            id: Date.now().toString(),
                            fullName: body.fullName,
                            email: body.email,
                            phone: body.phone,
                            dateOfBirth: body.dateOfBirth,
                            nationality: body.nationality,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                        token: "mock-jwt-token",
                    });
                } else if (url.includes("/profile")) {
                    // Mock profile update
                    const updatedUser = {
                        ...state.user,
                        ...body,
                        updatedAt: new Date().toISOString(),
                    } as User;
                    resolve({
                        user: updatedUser,
                        token: "mock-jwt-token",
                    });
                }
            }, 1000); // Simulate network delay
        });
    };

    // Check for existing auth on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const token = localStorage.getItem("userAuthToken");
                const userData = localStorage.getItem("userData");

                if (token && userData) {
                    const user = JSON.parse(userData);
                    setState({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } else {
                    setState({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (credentials: UserLoginData): Promise<void> => {
        try {
            setState((prev) => ({ ...prev, isLoading: true }));

            const response = await mockApiCall("/api/user/login", {
                method: "POST",
                body: JSON.stringify(credentials),
            });

            const { user, token } = response;

            // Store auth data
            localStorage.setItem("userAuthToken", token);
            localStorage.setItem("userData", JSON.stringify(user));

            setState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            setState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const register = async (userData: UserRegistrationData): Promise<void> => {
        try {
            setState((prev) => ({ ...prev, isLoading: true }));

            const response = await mockApiCall("/api/user/register", {
                method: "POST",
                body: JSON.stringify(userData),
            });

            const { user, token } = response;

            // Store auth data
            localStorage.setItem("userAuthToken", token);
            localStorage.setItem("userData", JSON.stringify(user));

            setState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            setState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const logout = (): void => {
        localStorage.removeItem("userAuthToken");
        localStorage.removeItem("userData");
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    const updateProfile = async (userData: Partial<User>): Promise<void> => {
        if (!state.user) throw new Error("User not authenticated");

        try {
            setState((prev) => ({ ...prev, isLoading: true }));

            const response = await mockApiCall("/api/user/profile", {
                method: "PUT",
                body: JSON.stringify(userData),
            });

            const updatedUser = response.user;

            // Update stored data
            localStorage.setItem("userData", JSON.stringify(updatedUser));

            setState({
                user: updatedUser,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            setState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const value: UserAuthContextType = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
    };

    return (
        <UserAuthContext.Provider value={value}>
            {children}
        </UserAuthContext.Provider>
    );
};
