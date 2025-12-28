import { CredentialView } from "@/features/credentials/components/credential";
import { CredentialsLoading } from "@/features/credentials/components/credentials";
import { ExecutionView } from "@/features/executions/components/execution";
import { ExecutionsLoading } from "@/features/executions/components/executions";
import { Suspense } from "react";

interface PageProps {
    params: Promise<{
        executionId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { executionId } = await params;

    return (
        <div className="p-4 md:px-10 md:py-6 h-full">
            <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-8 h-full">
                <Suspense fallback={<ExecutionsLoading />}>
                    <ExecutionView executionId={executionId} />
                </Suspense>
            </div>
        </div>
    )
}

export default Page;