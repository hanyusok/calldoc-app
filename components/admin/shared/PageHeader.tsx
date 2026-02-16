import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    backUrl?: string;
}

export default function PageHeader({ title, description, actions, backUrl }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                {backUrl && (
                    <Link
                        href={backUrl}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2 transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Back
                    </Link>
                )}
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
