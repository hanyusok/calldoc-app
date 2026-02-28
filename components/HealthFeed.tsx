"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface Post {
    id: string;
    title: string;
    content: string;
    category: string | null;
    createdAt: Date;
    imageUrl: string | null;
}

const HealthFeed = ({ posts }: { posts: Post[] }) => {
    const t = useTranslations('HealthFeed');

    // Fallback if no posts
    const displayPosts = posts.length > 0 ? posts : [];

    return (
        <div className="px-4 py-4 mb-20">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg text-gray-800">{t('title')}</h3>
                <Link href="/posts" className="text-xs text-primary-500 font-medium flex items-center">
                    {t('view_all')} <ChevronRight size={14} />
                </Link>
            </div>

            <div className="space-y-3">
                {displayPosts.map((post) => (
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
        </div>
    );
};

export default HealthFeed;
