
"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getPosts(query?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const where = query ? {
        OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { content: { contains: query, mode: 'insensitive' as const } },
        ]
    } : {};

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.post.count({ where })
    ]);

    return { posts, total, totalPages: Math.ceil(total / limit) };
}

export async function getPost(id: string) {
    return await prisma.post.findUnique({ where: { id } });
}

export async function createPost(formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const author = formData.get('author') as string;
    const imageUrl = formData.get('imageUrl') as string; // Ideally handle file upload, but string for now
    const published = formData.get('published') === 'true';

    await prisma.post.create({
        data: {
            title,
            content,
            category,
            author,
            imageUrl,
            published
        }
    });

    revalidatePath('/admin/posts');
    revalidatePath('/'); // Update homepage
}

export async function updatePost(id: string, formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const author = formData.get('author') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const published = formData.get('published') === 'true';

    await prisma.post.update({
        where: { id },
        data: {
            title,
            content,
            category,
            author,
            imageUrl,
            published
        }
    });

    revalidatePath('/admin/posts');
    revalidatePath('/');
}

export async function deletePost(id: string) {
    await prisma.post.delete({ where: { id } });
    revalidatePath('/admin/posts');
    revalidatePath('/');
}
