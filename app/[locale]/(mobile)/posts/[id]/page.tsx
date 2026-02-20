
import React from 'react';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { prisma } from "@/app/lib/prisma";
import Link from 'next/link';
import { ChevronLeft, Calendar, User, Tag, Share2, Bookmark } from 'lucide-react';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await prisma.post.findUnique({
        where: { id }
    });

    if (!post) {
        notFound();
    }

    const randomImage = `https://picsum.photos/seed/${post.id}/800/600`;

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* Minimal Sticky Header */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center gap-3 min-w-0">
                    <Link href="/posts" className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-700" />
                    </Link>
                    <span className="font-bold text-gray-900 truncate pr-4 text-base">
                        {post.title}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                        <Share2 size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                        <Bookmark size={20} />
                    </button>
                </div>
            </div>

            <article className="max-w-3xl mx-auto">
                {/* Hero Image */}
                <div className="aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden mb-8 sm:rounded-2xl sm:mt-4 sm:mx-auto sm:px-4">
                    <img
                        src={post.imageUrl || randomImage}
                        alt={post.title}
                        className="w-full h-full object-cover sm:rounded-2xl shadow-sm"
                    />
                </div>

                <div className="px-5">
                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        {post.category && (
                            <span className="inline-flex items-center text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-100">
                                <Tag size={12} className="mr-1.5" />
                                {post.category}
                            </span>
                        )}
                        <span className="flex items-center text-xs text-gray-400 font-medium">
                            <Calendar size={12} className="mr-1.5" />
                            {new Date(post.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        {post.author && (
                            <span className="flex items-center text-xs text-gray-400 font-medium">
                                <User size={12} className="mr-1.5" />
                                {post.author}
                            </span>
                        )}
                    </div>

                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-8 leading-[1.2] tracking-tight">
                        {post.title}
                    </h1>

                    {/* Content Section */}
                    <div className="prose prose-lg prose-gray max-w-none 
                        prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight
                        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-gray-100 prose-h2:pb-3
                        prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-5
                        prose-strong:text-gray-900 prose-strong:font-bold
                        prose-ul:list-disc prose-ul:pl-5
                        prose-li:text-gray-600 prose-li:mb-2
                        prose-img:rounded-2xl prose-img:shadow-md
                        ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* Footer/Related */}
                    <div className="mt-16 pt-8 border-t border-gray-100">
                        <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">도움이 되셨나요?</h4>
                                <p className="text-xs text-gray-500">다른 사람들에게도 이 정보를 공유해보세요.</p>
                            </div>
                            <button className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <Share2 size={16} />
                                공유하기
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            <BottomNav />
        </div>
    );
}
