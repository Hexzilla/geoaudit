import { User } from "./user.model";

export class Auth {
    jwt: string;
    user: User;
}

export interface ForgotPassword {
    email: string;
    url?: string;
}

export interface ResetPassword {
    code: string;
    password: string;
    passwordConfirmation: string;
}