"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Edit, Trash, Globe } from 'lucide-react';
import { deletePost, createPost, updatePost } from '@/app/actions/post';

interface Post {
    id: string;
    title: string;
    content: string;
    category: string | null;
    author: string | null;
    published: boolean;
    imageUrl: string | null;
    locale: string;
    createdAt: Date;
}

export default function PostsClient({ initialPosts, totalPages }: { initialPosts: any[], totalPages: number }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [posts, setPosts] = useState(initialPosts);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const currentLocaleFilter = searchParams.get('locale') || 'all';

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (searchParams.get('q') || "")) {
                const params = new URLSearchParams(searchParams);
                if (searchTerm) params.set('q', searchTerm);
                else params.delete('q');
                router.push(`?${params.toString()}`);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, router, searchParams]);

    // Update local state when initialPosts changes (from server re-render)
    useEffect(() => {
        setPosts(initialPosts);
    }, [initialPosts]);

    const handleLocaleFilterChange = (locale: string) => {
        const params = new URLSearchParams(searchParams);
        if (locale === 'all') params.delete('locale');
        else params.set('locale', locale);
        router.push(`?${params.toString()}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this post?")) {
            await deletePost(id);
            router.refresh();
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        if (editingPost) {
            await updatePost(editingPost.id, formData);
        } else {
            await createPost(formData);
        }

        setIsModalOpen(false);
        setEditingPost(null);
        router.refresh(); // Refresh to show new data
    };

    const openCreateModal = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const openEditModal = (post: any) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    return (
        <div>
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => handleLocaleFilterChange('all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentLocaleFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleLocaleFilterChange('ko')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentLocaleFilter === 'ko' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Korean
                    </button>
                    <button
                        onClick={() => handleLocaleFilterChange('en')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${currentLocaleFilter === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        English
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">New Article</span>
                        <span className="sm:hidden">New</span>
                    </button>
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lang</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{post.content.substring(0, 50)}...</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${post.locale === 'ko' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {post.locale === 'ko' ? 'KR' : 'EN'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                        {post.category || "General"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {post.author || "Unknown"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEditModal(post)} className="text-blue-600 hover:text-blue-900 mr-4">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900">
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">{editingPost ? 'Edit Article' : 'New Article'}</h2>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="post-form" onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="locale"
                                                value="ko"
                                                defaultChecked={editingPost ? editingPost.locale === 'ko' : true}
                                                className="mr-2 text-blue-600 focus:ring-blue-500"
                                            />
                                            Korean (한국어)
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="locale"
                                                value="en"
                                                defaultChecked={editingPost ? editingPost.locale === 'en' : false}
                                                className="mr-2 text-blue-600 focus:ring-blue-500"
                                            />
                                            English
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        name="title"
                                        defaultValue={editingPost?.title}
                                        required
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <input
                                            name="category"
                                            defaultValue={editingPost?.category || "Health"}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                        <input
                                            name="author"
                                            defaultValue={editingPost?.author || "Admin"}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <input
                                        name="imageUrl"
                                        defaultValue={editingPost?.imageUrl || ""}
                                        placeholder="/images/placeholder.jpg"
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea
                                        name="content"
                                        defaultValue={editingPost?.content}
                                        required
                                        rows={6}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="published"
                                        value="true"
                                        defaultChecked={editingPost ? editingPost.published : true}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    />
                                    <label className="ml-2 text-sm text-gray-700">Published</label>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="post-form"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {editingPost ? 'Save Changes' : 'Create Article'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
