import { RegisterForm } from "@/features/auth/register-form";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
// import { requireNoAuth } from "@/lib/auth-utils";

const Page = async () => {
    // requireNoAuth();
    
    return (
        <div>
            <RegisterForm />
        </div>
    )
}

export default Page