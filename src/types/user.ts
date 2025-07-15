export interface User {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserRegistrationData {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
}

export interface UserLoginData {
    email: string;
    password: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
} 
