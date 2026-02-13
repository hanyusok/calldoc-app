
import React from 'react';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { prisma } from "@/app/lib/prisma";
import Link from 'next/link';
import { ChevronLeft, Calendar, User, Tag } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await prisma.post.findUnique({
        where: { id }
    });

    if (!post) {
        notFound();
    }

    // Generate random image if not present or just enforce it as requested
    // User asked: "each post random image 300x300px create"
    // We can use the ID to generate a consistent random image
    const randomImage = `https://picsum.photos/seed/${post.id}/300/300`;

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-white px-4 py-3 flex items-center border-b border-gray-100 sticky top-0 z-10">
                <Link href="/posts" className="mr-3">
                    <ChevronLeft size={24} className="text-gray-700" />
                </Link>
                <h1 className="font-bold text-lg text-gray-900 truncate pr-4">{post.title}</h1>
            </div>

            <div className="p-4">
                <div className="w-full h-64 rounded-xl overflow-hidden mb-6 shadow-sm">
                    <img
                        src={post.imageUrl || randomImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {post.category && (
                        <span className="inline-flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            <Tag size={12} className="mr-1" />
                            {post.category}
                        </span>
                    )}
                    <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Calendar size={12} className="mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.author && (
                        <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            <User size={12} className="mr-1" />
                            {post.author}
                        </span>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {post.title}
                </h1>

                <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
