
import React, { useEffect, useMemo, useState } from 'react';
import type { BlogPost } from '../types';
import { SparklesIcon, ArrowUpRightIcon, ClockIcon } from './IconComponents';
import { api } from '../utils/api';

interface BlogPageProps {
    onNavigateHome: () => void;
    onSelectPost: (slug: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onSelectPost }) => {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        document.title = "Le Magazine Santé - PharmaNature";
        api.getBlogPosts().then(setBlogPosts).catch(console.error);
        window.scrollTo(0,0);
    }, []);

    return (
        <div className="bg-white dark:bg-brand-dark min-h-screen pb-24">
            {/* Magazine Header */}
            <div className="max-w-screen-xl mx-auto px-6 pt-20 pb-12 border-b border-gray-100 dark:border-gray-800 text-center">
                <span className="inline-block px-4 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6">
                    Pharma Magazine
                </span>
                <h1 className="text-5xl md:text-7xl font-serif font-black text-gray-900 dark:text-white mb-8 tracking-tight">
                    Votre Guide de <span className="text-brand-primary">Vitalité</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                    Découvrez les dernières avancées en micronutrition et nos secrets de soins naturels.
                </p>
            </div>

            <div className="max-w-screen-xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {blogPosts.map((post) => (
                        <article 
                            key={post.id} 
                            onClick={() => onSelectPost(post.slug)}
                            className="group cursor-pointer flex flex-col h-full"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-gray-100 dark:bg-gray-800 mb-6">
                                <img 
                                    src={post.imageUrl} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-brand-primary uppercase">
                                    {post.category}
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-4 group-hover:text-brand-primary transition-colors leading-snug">
                                {post.title}
                            </h3>
                            
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                {post.excerpt}
                            </p>

                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <img src={post.authorImageUrl} alt={post.author} className="w-8 h-8 rounded-full grayscale" />
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{post.author}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <ClockIcon className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase">{post.date}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};
