"use client"

import { WorkflowsContainer, WorkFlowsList } from "@/features/workflows/components/workflows"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { Suspense } from "react"

const Page = () => {
    useAuthRedirect({ requireAuth: true })
    return (
        <WorkflowsContainer>
            <Suspense fallback={<div>Loading...</div>}>
                <WorkFlowsList />
            </Suspense>
        </WorkflowsContainer>

    )
}

export default Page