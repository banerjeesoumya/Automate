"use client"
export const dynamic = "force-dynamic";

import { CredentialsContainer, CredentialsList, CredentialsLoading } from "@/features/credentials/components/credentials";
import { WorkflowsContainer, WorkFlowsList, WorkflowsLoading } from "@/features/workflows/components/workflows"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { Suspense } from "react"

const Page = () => {
    useAuthRedirect({ requireAuth: true })
    return (
        <CredentialsContainer>
            <Suspense fallback={<CredentialsLoading />}>
                <CredentialsList />
            </Suspense>
        </CredentialsContainer>

    )
}

export default Page