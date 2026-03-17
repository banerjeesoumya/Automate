import { EmptyView, EntityContainer, EntityHeader, EntityPagination, EntitySearch, LoadingView } from "@/components/entity-components";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { useSuspenseTemplates, useUseTemplate, useCreateTemplate } from "@/hooks/templates/use-templates";
import { useTemplatesParams } from "@/hooks/templates/use-templates-params";
import { Template } from "@/lib/api";
import { LayoutTemplateIcon, ClockIcon, Share2Icon, PackageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const TemplatesSearch = () => {
    const [params, setParams] = useTemplatesParams();
    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams,
    })

    return (
        <EntitySearch
            placeholder="Search Templates"
            value={searchValue}
            onChange={onSearchChange}
         />
    )
}

export const TemplatesList = () => {
    const templates = useSuspenseTemplates();
    const [params, setParams] = useTemplatesParams();

    if (templates.data.items.length === 0) {
        return <TemplatesEmpty />
    }
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.data.items.map((template) => (
                    <TemplateItem key={template.id} template={template} />
                ))}
            </div>
            <TemplatesPagination
                page={templates.data.page}
                totalPages={templates.data.totalPages}
                isFetching={templates.isFetching}
                onPageChange={(page) => setParams({ ...params, page })}
            />
        </div>
    )
}

export const TemplatesHeader = ({ disabled }: { disabled?: boolean }) => {
    return (
        <>
            <EntityHeader
                title="Templates"
                description="Browse and use community templates to jumpstart your workflows"
                disabled={disabled}
            />
        </>
    )
}

interface TemplatesPaginationProps {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export const TemplatesPagination = ({
  page,
  totalPages,
  isFetching,
  onPageChange,
}: TemplatesPaginationProps) => {
  return (
    <EntityPagination
      disabled={isFetching}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  );
};

export const TemplatesLoading = () => {
    return (
        <LoadingView message="Loading Templates" />
    )
}

export const TemplatesEmpty = () => {
    return (
        <>
            <EmptyView
                message="No templates found. Check back later for new templates."
            />
        </>
    )
}

export const TemplateItem = ({ template }: { template: Template }) => {
    const useTemplate = useUseTemplate();
    const router = useRouter();

    const handleUseTemplate = () => {
        useTemplate.mutate(template.id);
    }

    const formatNodeName = (name: string) => {
        if (!name) return "";
        if (name.toUpperCase() === "HTTP") return "HTTP";
        
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <Card 
            className="flex flex-col h-full hover:border-primary/50 transition-colors bg-card group cursor-pointer shadow-sm hover:shadow-md"
        >
            <CardHeader className="flex flex-col items-start justify-between gap-y-4 pb-4">
                <div className="flex w-full items-start justify-between gap-x-4">
                    <CardTitle className="text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {template.title}
                    </CardTitle>
                    <div className="size-8 shrink-0 bg-secondary text-secondary-foreground flex items-center justify-center rounded-full border">
                        <LayoutTemplateIcon className="size-4" />
                    </div>
                </div>
                <CardDescription className="line-clamp-2 text-sm mt-0 h-10">
                    {template.description || "No description provided."}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 flex-1">
                <Separator className="mb-4" />
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground">
                    <div className="space-y-1.5 flex flex-col items-start bg-secondary/30 p-2 rounded-lg">
                        <span className="uppercase tracking-wider text-[10px] text-muted-foreground/70 flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            Setup Time
                        </span>
                        <span className="text-foreground">~2 mins</span>
                    </div>
                    <div className="space-y-1.5 flex flex-col items-start bg-secondary/30 p-2 rounded-lg">
                        <span className="uppercase tracking-wider text-[10px] text-muted-foreground/70 flex items-center gap-1">
                            <Share2Icon className="size-3" />
                            Nodes Count
                        </span>
                        <span className="text-foreground">{template.workflow.nodes.length} Nodes</span>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <span className="uppercase tracking-wider text-[10px] text-muted-foreground/70 flex items-center gap-1 font-medium">
                        Nodes Used
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {template.workflow.nodes.slice(0, 3).map((node) => (
                            <span 
                                key={node.id} 
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground"
                            >
                                {formatNodeName(node.type || node.name)}
                            </span>
                        ))}
                        {template.workflow.nodes.length > 3 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                                +{template.workflow.nodes.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                 <Button 
                    className="flex-1 gap-x-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant={useTemplate.isPending ? "secondary" : "default"}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUseTemplate();
                    }}
                    disabled={useTemplate.isPending}
                 >
                     {useTemplate.isPending ? "Adding..." : "Use Template"}
                 </Button>
                 <Link href={`/templates/${template.id}/guide`} className="flex-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" className="w-full h-full border-border">Guide</Button>
                 </Link>
            </CardFooter>
        </Card>
    )
}

export const TemplatesContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<TemplatesHeader />}
            search={<TemplatesSearch />}
        >
            {children}
        </EntityContainer>
    )
}
