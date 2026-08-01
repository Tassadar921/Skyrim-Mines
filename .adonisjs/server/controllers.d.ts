export declare const controllers: {
    admin: {
        Dashboard: () => Promise<typeof import("#controllers/admin/dashboard_controller")>;
        Users: () => Promise<typeof import("#controllers/admin/users_controller")>;
    };
    Auth: () => Promise<typeof import("#controllers/auth_controller")>;
    EmailVerification: () => Promise<typeof import("#controllers/email_verification_controller")>;
    ForgotPassword: () => Promise<typeof import("#controllers/forgot_password_controller")>;
    Legal: () => Promise<typeof import("#controllers/legal_controller")>;
    PasswordReset: () => Promise<typeof import("#controllers/password_reset_controller")>;
    Profile: () => Promise<typeof import("#controllers/profile_controller")>;
    Register: () => Promise<typeof import("#controllers/register_controller")>;
    Simulator: () => Promise<typeof import("#controllers/simulator_controller")>;
    Terms: () => Promise<typeof import("#controllers/terms_controller")>;
};
