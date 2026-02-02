import LoginButton from "@/components/LoginButton";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm flex flex-col items-center gap-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary-500 mb-2">CallDoc</h1>
                    <p className="text-gray-500">Your Personal Healthcare Assistant</p>
                </div>

                <div className="w-full bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 mb-6 text-center">Sign in to continue</h2>
                    <LoginButton />

                    <p className="text-xs text-center text-gray-400 mt-4">
                        By logging in, you agree to our Terms and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
