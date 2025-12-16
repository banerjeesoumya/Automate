import { CredentialView } from "@/features/credentials/components/credential";
import { CredentialsLoading } from "@/features/credentials/components/credentials";
import { Suspense } from "react";

interface PageProps {
    params: Promise<{
        credentialId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { credentialId } = await params;

    return (
        <div className="p-4 md:px-10 md:py-6 h-full">
            <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-8 h-full">
                <Suspense fallback={<CredentialsLoading />}>
                    <CredentialView credentialId={credentialId} />
                </Suspense>
            </div>
        </div>
    )
}

export default Page;