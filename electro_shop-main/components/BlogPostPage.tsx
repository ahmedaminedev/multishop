import React, { useState, useEffect } from 'react';
import type { BlogPost } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { CalendarIcon, UserIcon, TagIcon, ChevronRightIcon } from './IconComponents';
import { api } from '../utils/api';

interface BlogPostPageProps {
    slug: string;
    onNavigateHome: () => void;
    onNavigateToBlog: () => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, onNavigateHome, onNavigateToBlog }) => {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        Promise.all([
            api.getBlogPostBySlug(slug).catch(() => null),
            api.getBlogPosts().catch(() => [])
        ]).then(([foundPost, allPosts]) => {
            if (!isMounted) return;
            if (foundPost) {
                setPost(foundPost);
                document.title = `${foundPost.title} - Electro Shop Blog`;
            } else if (Array.isArray(allPosts)) {
                const fallback = allPosts.find((p: any) => p.slug === slug);
                if (fallback) {
                    setPost(fallback);
                    document.title = `${fallback.title} - Electro Shop Blog`;
                }
            }
            if (Array.isArray(allPosts)) {
                setRecentPosts(allPosts.filter((p: any) => p.slug !== slug).slice(0, 3));
            }
            setLoading(false);
        });

        return () => { isMounted = false; };
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Article non trouvé</h1>
                <button onClick={onNavigateToBlog} className="mt-4 text-red-600 hover:underline">Retour au blog</button>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-gray-950">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Breadcrumb items={[
                        { name: 'Accueil', onClick: onNavigateHome }, 
                        { name: 'Blog', onClick: onNavigateToBlog },
                        { name: post.title }
                    ]} />
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <main className="w-full lg:w-2/3">
                        <article>
                            <header className="mb-8">
                                <p className="text-base text-red-600 dark:text-red-500 font-semibold tracking-wide uppercase">{post.category}</p>
                                <h1 className="mt-2 block text-3xl text-center lg:text-left leading-8 font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">{post.title}</h1>
                                <div className="mt-6 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <img src={post.authorImageUrl} alt={post.author} className="w-8 h-8 rounded-full" />
                                        <span>{post.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5"/>
                                        <time dateTime={post.date}>{post.date}</time>
                                    </div>
                                </div>
                            </header>

                            <figure className="mb-8">
                                <img src={post.imageUrl} alt={post.title} className="w-full rounded-lg shadow-lg object-cover" />
                            </figure>

                            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                                {post.content.split('\n\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </article>
                    </main>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-1/3">
                         <div className="sticky top-24 space-y-8">
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-4">À propos de l'auteur</h3>
                                <div className="flex items-center">
                                    <img src={post.authorImageUrl} alt={post.author} className="w-16 h-16 rounded-full mr-4" />
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{post.author}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Rédacteur expert chez Electro Shop, passionné de nouvelles technologies.</p>
                                    </div>
                                </div>
                            </div>

                             <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-4">Articles Récents</h3>
                                <ul className="space-y-4">
                                    {recentPosts.map(recentPost => (
                                        <li key={recentPost.id}>
                                             <a href="#" onClick={(e) => { e.preventDefault(); /* This should navigate */ }} className="group flex items-center gap-4">
                                                <img src={recentPost.imageUrl} alt={recentPost.title} className="w-20 h-16 object-cover rounded-md flex-shrink-0" />
                                                <div>
                                                     <p className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-red-600 transition-colors line-clamp-2">{recentPost.title}</p>
                                                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{recentPost.date}</p>
                                                </div>
                                             </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                         </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};