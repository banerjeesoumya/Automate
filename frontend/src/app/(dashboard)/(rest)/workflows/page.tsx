"use client"
export const dynamic = "force-dynamic";

import { WorkflowsContainer, WorkFlowsList, WorkflowsLoading } from "@/features/workflows/components/workflows"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { Suspense } from "react"

const Page = () => {
    useAuthRedirect({ requireAuth: true })
    return (
        <div className="min-h-screen bg-background overflow-hidden relative">

            <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-white to-zinc-100 dark:from-zinc-900 dark:via-black dark:to-zinc-900" />

            <div className="absolute top-20 left-20 w-72 h-72 bg-[#e78a53]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl" />

            <div className="relative z-10 p-4 md:p-8">
                <WorkflowsContainer>
                    <Suspense fallback={<WorkflowsLoading />}>
                        <WorkFlowsList />
                    </Suspense>
                </WorkflowsContainer>
            </div>
        </div>
    )
}

export default Page