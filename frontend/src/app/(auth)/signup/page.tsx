import { RegisterForm } from "@/features/auth/register-form";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

const Page = async () => {
    
    return (
        <div>
            <RegisterForm />
        </div>
    )
}

export default Page