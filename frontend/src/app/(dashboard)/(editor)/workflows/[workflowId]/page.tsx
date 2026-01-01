import { Editor, EditorLoading } from "@/features/editor/components/editor";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { Suspense } from "react";

interface PageProps {
    params: Promise<{
        workflowId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { workflowId } = await params;

    return (
        <Suspense fallback={<EditorLoading />}>
            <EditorHeader workflowId={workflowId} />
            <main>
                <Editor workflowId={workflowId} />
            </main>
        </Suspense>
    )
}

export default Page;