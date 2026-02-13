
import React from 'react';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { prisma } from "@/app/lib/prisma";
import { useTranslations } from 'next-intl';
import { getTranslations } from "next-intl/server";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default async function PostsPage() {
    const t = await getTranslations('HealthFeed');

    const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        where: { published: true }
    });

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="bg-white px-4 py-3 flex items-center border-b border-gray-100 sticky top-0 z-10">
                <Link href="/" className="mr-3">
                    <ChevronLeft size={24} className="text-gray-700" />
                </Link>
                <h1 className="font-bold text-lg text-gray-900">{t('title')}</h1>
            </div>

            <div className="px-4 py-4 space-y-3">
                {posts.map((post) => (
                    <Link key={post.id} href={`/posts/${post.id}`} className="block">
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${post.imageUrl || `https://picsum.photos/seed/${post.id}/300/300`})` }}
                            />
                            <div className="flex flex-col justify-between py-1 w-full">
                                <div>
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                        {post.category || t('health_tip')}
                                    </span>
                                    <h4 className="font-bold text-sm mt-1 leading-tight line-clamp-2">{post.title}</h4>
                                </div>
                                <p className="text-xs text-gray-400">5 min read</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            <BottomNav />
        </div>
    );
}
