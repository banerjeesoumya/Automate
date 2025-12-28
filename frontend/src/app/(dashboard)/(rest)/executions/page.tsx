"use client"
export const dynamic = "force-dynamic";

import { CredentialsContainer, CredentialsList, CredentialsLoading } from "@/features/credentials/components/credentials";
import { ExecutionsContainer, ExecutionsList, ExecutionsLoading } from "@/features/executions/components/executions";
import { WorkflowsContainer, WorkFlowsList, WorkflowsLoading } from "@/features/workflows/components/workflows"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { Suspense } from "react"

const Page = () => {
    useAuthRedirect({ requireAuth: true })
    return (
        <ExecutionsContainer>
            <Suspense fallback={<ExecutionsLoading />}>
                <ExecutionsList />
            </Suspense>
        </ExecutionsContainer>

    )
}

export default Page