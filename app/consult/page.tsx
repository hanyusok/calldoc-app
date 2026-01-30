import React from 'react';
import Header from "@/components/Header"; // We might need to refactor Header to allow passing search params or handle search internally better
import BottomNav from "@/components/BottomNav";
import DoctorCard from "@/components/consult/DoctorCard";
import FilterBar from "@/components/consult/FilterBar";
import { getDoctors } from "./actions";
import Link from "next/link";
import { ChevronLeft, Search } from 'lucide-react';

export default async function ConsultPage(props: {
    searchParams: Promise<{ query?: string; category?: string; filter?: string }>
}) {
    const params = await props.searchParams;

    const doctors = await getDoctors({
        query: params.query,
        category: params.category,
        filter: params.filter
    });

    const title = params.category
        ? params.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Find a Doctor';

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Custom Header for Consult Page */}
            <div className="bg-white sticky top-0 z-50 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <Link href="/" className="text-gray-600 hover:text-gray-900">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                </div>

                {/* Search Input - duplicated from Header for now, or could be a component */}
                <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    {/* Client component for search input behavior would be better, but simple form works for SSR */}
                    <form action="/consult" method="GET">
                        {/* Preserve existing params as hidden inputs if needed, or just clear them on new search */}
                        <input
                            name="query"
                            defaultValue={params.query}
                            type="text"
                            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                            placeholder="Search doctor, hospital, etc..."
                        />
                    </form>
                </div>

                <FilterBar />
            </div>

            <div className="px-4 py-4 space-y-4">
                {doctors.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p>No doctors found matching your criteria.</p>
                        <Link href="/consult" className="text-primary-500 text-sm mt-2 inline-block">
                            Clear all filters
                        </Link>
                    </div>
                ) : (
                    doctors.map(doc => (
                        <DoctorCard key={doc.id} doctor={doc} />
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    );
}
