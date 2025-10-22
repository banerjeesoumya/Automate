import { LoginForm } from "@/features/auth/login-form"
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

const Page = async () => {
    
    return (
        <LoginForm />
    )
}

export default Page