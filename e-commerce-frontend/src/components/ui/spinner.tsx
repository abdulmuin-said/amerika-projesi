import { cn } from '@/lib/utils';
import React from 'react';

export default function Spinner({className = ""}: {className?: string}) {
    return <svg
        className={cn("w-12 h-12 animate-spin", className)}
        viewBox="25 25 50 50"
    >
        <circle
            className="animate-dash"
            stroke='currentColor'
            cx="50"
            cy="50"
            r="20"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
        />
    </svg>
}