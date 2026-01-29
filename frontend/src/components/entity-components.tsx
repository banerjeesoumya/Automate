import { MoreVerticalIcon, PackageOpenIcon, PlusIcon, SearchIcon, TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import React from "react";
import { motion } from "framer-motion";

type EntityHeaderProps = {
    title: string;
    description?: string;
    newButtonLabel?: string;
    disabled?: boolean;
    isCreating?: boolean;
} & (
        | { onNew: () => void; newButtonHref?: never }
        | { newButtonHref: string; onNew?: never }
        | { onNew?: never; newButtonHref?: never }
    )


export const EntityHeader = ({ title, description, newButtonLabel, disabled, isCreating, onNew, newButtonHref }: EntityHeaderProps) => {
    return (
        <div className="flex flex-row items-center justify-between gap-x-4">
            <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
                {description && (
                    <p className="text-xs md:text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {onNew && !newButtonHref && (
                <Button disabled={disabled || isCreating} onClick={onNew} size="sm">
                    <PlusIcon className="size-4" />
                    {newButtonLabel}
                </Button>
            )}
            {newButtonHref && !onNew && (
                <Button asChild size="sm">
                    <Link href={newButtonHref} prefetch>
                        <PlusIcon className="size-4" />
                        {newButtonLabel}
                    </Link>
                </Button>
            )}
        </div>
    );
}

type EntityContainerProps = {
    header?: React.ReactNode;
    search?: React.ReactNode;
    pagination?: React.ReactNode;
    children: React.ReactNode;
}

export const EntityContainer = ({ header, search, pagination, children }: EntityContainerProps) => {
    return (
        <div className="p-4 md:px-10 md:py-6 h-full">
            <div className="mx-auto max-w-screen w-full flex flex-col gap-y-8 h-full">
                {header}
                <div className="flex flex-col gap-y-4 h-full">
                    {search}
                    {children}
                </div>
                {pagination}
            </div>
        </div>
    )
}

interface EntitySearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const EntitySearch = ({ value, onChange, placeholder }: EntitySearchProps) => {
    return (
        <div className="relative ml-auto">
            <SearchIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
                className="max-w-[200px] bg-background shadow-none border-border pl-8"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}

interface EntityPaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

export const EntityPagination = ({ page, totalPages, onPageChange, disabled }: EntityPaginationProps) => {
    return (
        <div className="flex items-center justify-between gap-x-2">
            <div className="flex-1 text-sm text-muted-foreground">
                Page {page} of {totalPages || 1}
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    disabled={disabled || page === 1}
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    variant="outline"
                    size="sm"
                >
                    Previous
                </Button>
                <Button
                    disabled={disabled || page === totalPages || totalPages === 0}
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    variant="outline"
                    size="sm"
                >
                    Next
                </Button>
            </div>
        </div>
    )
}

interface StateViewProps {
    message?: string;
}

export const LoadingView = ({ message }: StateViewProps) => {
    return (
        <div className="flex justify-center items-center h-full flex-1 flex-col gap-y-4">
            <svg
                fill="none"
                viewBox="0 0 78 30"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="h-10 w-auto"
            >
                <motion.path
                    d="M18.5147 0C15.4686 0 12.5473 1.21005 10.3934 3.36396L3.36396 10.3934C1.21005 12.5473 0 15.4686 0 18.5147C0 24.8579 5.14214 30 11.4853 30C14.5314 30 17.4527 28.7899 19.6066 26.636L24.4689 21.7737C24.469 21.7738 24.4689 21.7736 24.4689 21.7737L38.636 7.6066C39.6647 6.57791 41.0599 6 42.5147 6C44.9503 6 47.0152 7.58741 47.7311 9.78407L52.2022 5.31296C50.1625 2.11834 46.586 0 42.5147 0C39.4686 0 36.5473 1.21005 34.3934 3.36396L15.364 22.3934C14.3353 23.4221 12.9401 24 11.4853 24C8.45584 24 6 21.5442 6 18.5147C6 17.0599 6.57791 15.6647 7.6066 14.636L14.636 7.6066C15.6647 6.57791 17.0599 6 18.5147 6C20.9504 6 23.0152 7.58748 23.7311 9.78421L28.2023 5.31307C26.1626 2.1184 22.5861 0 18.5147 0Z"
                    fill="#FFBC7D"
                    animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.98, 1, 0.98],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.path
                    d="M39.364 22.3934C38.3353 23.4221 36.9401 24 35.4853 24C33.05 24 30.9853 22.413 30.2692 20.2167L25.7982 24.6877C27.838 27.8819 31.4143 30 35.4853 30C38.5314 30 41.4527 28.7899 43.6066 26.636L62.636 7.6066C63.6647 6.57791 65.0599 6 66.5147 6C69.5442 6 72 8.45584 72 11.4853C72 12.9401 71.4221 14.3353 70.3934 15.364L63.364 22.3934C62.3353 23.4221 60.9401 24 59.4853 24C57.0498 24 54.985 22.4127 54.269 20.2162L49.798 24.6873C51.8377 27.8818 55.4141 30 59.4853 30C62.5314 30 65.4527 28.7899 67.6066 26.636L74.636 19.6066C76.7899 17.4527 78 14.5314 78 11.4853C78 5.14214 72.8579 0 66.5147 0C63.4686 0 60.5473 1.21005 58.3934 3.36396L39.364 22.3934Z"
                    fill="#FF9736"
                    animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.98, 1, 0.98],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                    }}
                />
            </svg>
            {!!message && (
                <p className="text-sm text-muted-foreground">
                    {message}
                </p>
            )}
        </div>
    )
}

interface EmptyViewProps extends StateViewProps {
    onNew?: () => void;
}

export const EmptyView = ({ message, onNew }: EmptyViewProps) => {
    return (
        <Empty className="border border-dashed bg-background text-foreground">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <PackageOpenIcon />
                </EmptyMedia>
            </EmptyHeader>
            <EmptyTitle>
                No Items
            </EmptyTitle>
            {!!message && (
                <EmptyDescription>
                    {message}
                </EmptyDescription>
            )}
            {onNew && (
                <EmptyContent>
                    <Button onClick={onNew} size="sm">
                        <PlusIcon className="size-4" />
                        Add Item
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    )
}

interface EntityListingProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    getKey: (item: T, index: number) => string | number;
    emptyView?: React.ReactNode;
    className?: string;
}

export function EntityList<T>({ items, renderItem, getKey, emptyView, className }: EntityListingProps<T>) {
    if (items.length === 0 && emptyView) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <div className="max-w-sm mx-auto">{emptyView}</div>
            </div>
        )
    }

    return (
        <div className={cn(
            "flex flex-col gap-y-4",
            className
        )}>
            {items.map((item, index) => (
                <div key={getKey ? getKey(item, index) : index}>
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    );
}

interface EntityItemsProps {
    href: string;
    title: string;
    subtitle?: React.ReactNode;
    image?: React.ReactNode;
    actions?: React.ReactNode;
    onRemove?: () => void | Promise<void>;
    isRemoving?: boolean;
    className?: string;
}

export const EntityItem = ({ href, title, subtitle, image, actions, onRemove, isRemoving, className }: EntityItemsProps) => {

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isRemoving) {
            return;
        }

        if (onRemove) {
            await onRemove();
        }
    }

    return (
        <Link href={href} prefetch>
            <Card
                className={cn(
                    "p-4 shadow-none hover:shadow cursor-pointer",
                    isRemoving && "opacity-50 cursor-not-allowed",
                    className
                )}
            >
                <CardContent className="flex flex-row items-center justify-between p-0">
                    <div className="flex items-center gap-3">
                        {image}
                        <div>
                            <CardTitle className="text-base font-medium">
                                {title}
                            </CardTitle>
                            {!!subtitle && (
                                <CardDescription className="text-xs">
                                    {subtitle}
                                </CardDescription>
                            )}
                        </div>
                    </div>
                    {(actions || onRemove) && (
                        <div className="flex gap-x-4 items-center">
                            {actions}
                            {onRemove && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVerticalIcon className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <DropdownMenuItem onClick={handleRemove}>
                                            <TrashIcon className="size-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}