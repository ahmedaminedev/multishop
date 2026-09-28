import React, { useEffect, useMemo } from 'react';
import type { BlogPost } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { CalendarIcon, UserIcon, TagIcon, SearchIcon } from './IconComponents';
import { blogPosts } from '../constants';

interface BlogPageProps {
    onNavigateHome: () => void;
    onSelectPost: (slug: string) => void;
}

const BlogSidebar: React.FC<{
    categories: string[];
    recentPosts: BlogPost[];
    onSelectPost: (slug: string) => void;
}> = ({ categories, recentPosts, onSelectPost }) => {
    return (
        <aside className="w-full lg:w-1/3 xl:w-1/4 space-y-8 sticky top-24">
            {/* Search */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Rechercher</h3>
                <div className="relative">
                    <input type="search" placeholder="Rechercher un article..." className="w-full border-gray-300 dark:border-gray-600 rounded-md py-2 pl-4 pr-10 bg-gray-50 dark:bg-gray-700 focus:ring-red-500 focus:border-red-500" />
                    <div className="absolute top-0 right-0 flex items-center h-full pr-3">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Catégories</h3>
                <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                        <a href="#" key={category} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            {category}
                        </a>
                    ))}
                </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Articles Récents</h3>
                <ul className="space-y-4">
                    {recentPosts.map(post => (
                        <li key={post.id}>
                            <a href="#" onClick={(e) => { e.preventDefault(); onSelectPost(post.slug);}} className="group flex items-center gap-4">
                                <img src={post.imageUrl} alt="" className="w-16 h-16 object-cover rounded-md flex-shrink-0"/>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-red-600 transition-colors line-clamp-2 text-sm">{post.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{post.date}</p>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}


const BlogPostCard: React.FC<{ post: BlogPost; onSelectPost: (slug: string) => void; }> = ({ post, onSelectPost }) => {
    return (
        <article 
            onClick={() => onSelectPost(post.slug)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
            <div className="relative overflow-hidden">
                <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">{post.category}</span>
            </div>
            <div className="p-6 flex flex-col">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <CalendarIcon className="w-4 h-4 mr-1.5"/> 
                    <span>{post.date}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors flex-grow">
                    {post.title}
                </h2>
                <div className="flex items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <img src={post.authorImageUrl} alt={post.author} className="w-8 h-8 rounded-full mr-3" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{post.author}</span>
                </div>
            </div>
        </article>
    );
};

const FeaturedPostCard: React.FC<{ post: BlogPost; onSelectPost: (slug: string) => void; }> = ({ post, onSelectPost }) => {
    return (
        <article
            onClick={() => onSelectPost(post.slug)}
            className="col-span-1 md:col-span-2 rounded-lg shadow-lg overflow-hidden group cursor-pointer relative"
        >
            <img src={post.imageUrl} alt={post.title} className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white">
                 <div className="flex items-center text-sm text-gray-200 mb-3 space-x-4">
                    <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">{post.category}</span>
                    <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2"/> 
                        <span>{post.date}</span>
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold mb-4 group-hover:text-yellow-300 transition-colors">
                    {post.title}
                </h1>
                <div className="flex items-center mt-4">
                    <img src={post.authorImageUrl} alt={post.author} className="w-10 h-10 rounded-full mr-4 border-2 border-white/50" />
                    <div>
                        <p className="font-bold">{post.author}</p>
                        <p className="text-xs text-gray-300">Rédacteur</p>
                    </div>
                </div>
            </div>
        </article>
    );
};

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigateHome, onSelectPost }) => {
    useEffect(() => {
        document.title = `Blog - Electro Shop`;
    }, []);
    
    const [featuredPost, ...otherPosts] = useMemo(() => {
        const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const featured = sortedPosts.find(p => p.featured) || sortedPosts[0];
        const others = sortedPosts.filter(p => p.id !== featured.id);
        return [featured, ...others];
    }, []);

    const categories = useMemo(() => [...new Set(blogPosts.map(p => p.category))], []);
    const recentPosts = useMemo(() => [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4), []);


    return (
        <div className="bg-gray-100 dark:bg-gray-900">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <Breadcrumb items={[{ name: 'Accueil', onClick: onNavigateHome }, { name: 'Blog' }]} />
                </div>
                
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Le Coin des Experts</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Conseils, astuces et nouveautés sur l'électroménager et la technologie.</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <main className="w-full lg:w-2/3 xl:w-3/4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {featuredPost && <FeaturedPostCard post={featuredPost} onSelectPost={onSelectPost} />}
                            {otherPosts.map(post => (
                                <BlogPostCard key={post.id} post={post} onSelectPost={onSelectPost} />
                            ))}
                        </div>
                    </main>

                    {/* Sidebar */}
                    <BlogSidebar categories={categories} recentPosts={recentPosts} onSelectPost={onSelectPost}/>
                </div>
            </div>
        </div>
    );
};