import React from 'react';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
}

export default function PageContainer({ children, className = "" }: PageContainerProps) {
    return (
        <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
            {children}
        </div>
    );
}
