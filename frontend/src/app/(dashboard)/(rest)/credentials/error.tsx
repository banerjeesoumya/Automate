"use client"

import { Error } from "@/components/error"

const ErrorPage = () => {
    return (
        <Error title="Error Loading Credentials" description="There was an error loading your credentials" />
    )
}

export default ErrorPage