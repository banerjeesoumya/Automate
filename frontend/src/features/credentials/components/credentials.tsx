"use client"

import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, LoadingView } from "@/components/entity-components";
import { useRouter } from "next/navigation";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useCredentialsParams } from "@/hooks/use-credentials-params";
import { useDeleteCredential, useSuspenseCredentials } from "@/hooks/use-credentials";
import { Credential, CredentialType } from "@/lib/utils";

export const CredentialsSearch = () => {
    const [params, setParams] = useCredentialsParams();
    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams,
    })

    return (
        <EntitySearch
            placeholder="Search Workflows"
            value={searchValue}
            onChange={onSearchChange}
         />
    )
}

export const CredentialsList = () => {

    // throw new Error("Test Error in WorkflowsList");
    const credentials = useSuspenseCredentials();
    const [params, setParams] = useCredentialsParams();
    
    return (
        <>
            <EntityList
            items={credentials.data.items}
            renderItem={(credential) => <CredentialItem credential={credential} />}
            getKey={(credential) => credential.id}
            emptyView={<CredentialsEmpty />}
            />
            <CredentialsPagination
                page={credentials.data.page}
                totalPages={credentials.data.totalPages}
                isFetching={credentials.isFetching}
                onPageChange={(page) => setParams({ ...params, page })}
            />
        </>
    )
}

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {

    return (
        <>
            <EntityHeader
                title="Credentials"
                description="Create and manage your credentials for various services."
                newButtonLabel="New Credential"
                disabled={disabled}
                newButtonHref="/credentials/new"
            />
        </>
    )
}

interface CredentialsPaginationProps {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export const CredentialsPagination = ({
    page,
    totalPages,
    isFetching,
    onPageChange,
}: CredentialsPaginationProps) => {

    return (
        <EntityPagination
            disabled={isFetching}
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
        />
    )
}

export const CredentialsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<CredentialsHeader />}
            search={<CredentialsSearch />}
        >
            {children}
        </EntityContainer>
    )
}

export const CredentialsLoading = () => {
    return (
        <LoadingView message="Loading Credentials" />
    )
}

export const CredentialsEmpty = () => {
    const router = useRouter();

    const handleCreate = () => {
        router.push("/credentials/new");
    }
    return (
        <>
            <EmptyView
                message="No credentials found.You haven't created any credentials yet. Click the button below to create your first credential."
                onNew={handleCreate}
            />
        </>
    )
}

const credentialLogos: Record<CredentialType, string> = {
    [CredentialType.GEMINI]: "/gemini.svg",
    [CredentialType.OPEN_AI]: "/openai.svg",
    [CredentialType.ANTHROPIC]: "/anthropic.svg",
}

export const CredentialItem = ({ credential }: { credential: Credential }) => {
    
    const removeCredential = useDeleteCredential();

    const handleRemove = () => {
        removeCredential.mutate({ id: credential.id });
    }

    const logo = credentialLogos[credential.type] || "/gemini.svg";

    return (
        <EntityItem
           href={`/credentials/${credential.id}`}
           title={credential.name}
           subtitle={
            <>
                Updated {formatDistanceToNow((credential.updatedAt), { addSuffix: true })}{" "}
                &bull; Created {" "} {formatDistanceToNow((credential.createdAt), { addSuffix: true })}
            </>
           }
           image={
            <div className="size-8 flex items-center justify-center">
                <Image src={logo} alt={credential.type} width={20} height={20} />
            </div>
           }
           onRemove={handleRemove}
           isRemoving={removeCredential.isPending}
       />
    )
}