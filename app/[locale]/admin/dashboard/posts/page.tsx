
import { Suspense } from 'react';
import PostsClient from './PostsClient';
import { getPosts } from '@/app/actions/post';

export default async function AdminPostsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string; locale?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const page = Number(params.page) || 1;
    const locale = params.locale || 'all';

    const { posts, totalPages } = await getPosts(query, page, 20, locale);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Article Management</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <PostsClient initialPosts={posts} totalPages={totalPages} />
            </Suspense>
        </div>
    );
}
