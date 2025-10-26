"use client"

import { NodeSelector } from "@/components/node-selector"
// import { NodeSelector } from "@/components/node-selector"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { memo, useState } from "react"

export const AddNodeButton = memo(() => {
    const [open, setOpen] = useState(false)

    return (
        <NodeSelector open={open} onOpenChange={setOpen}>
            <Button className="bg-background" variant="ghost" size="icon">
                <PlusIcon />
            </Button>
        </NodeSelector>
    )
})

AddNodeButton.displayName = "AddNodeButton"