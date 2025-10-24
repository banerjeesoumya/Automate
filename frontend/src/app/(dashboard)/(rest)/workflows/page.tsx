"use client"
export const dynamic = "force-dynamic";

import { WorkflowsContainer, WorkFlowsList, WorkflowsLoading } from "@/features/workflows/components/workflows"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { Suspense } from "react"

const Page = () => {
    useAuthRedirect({ requireAuth: true })
    return (
        <WorkflowsContainer>
            <Suspense fallback={<WorkflowsLoading />}>
                <WorkFlowsList />
            </Suspense>
        </WorkflowsContainer>

    )
}

export default Page