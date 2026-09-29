
import React, { useEffect, useState } from 'react';
import type { BlogPost } from '../types';
import { CalendarIcon, FacebookIcon, TwitterIcon, InstagramIcon, ArrowLongLeftIcon, ClockIcon, HeartIcon } from './IconComponents';
import { api } from '../utils/api';

interface BlogPostPageProps {
    slug: string;
    onNavigateHome: () => void;
    onNavigateToBlog: () => void;
}

const SocialShareButton: React.FC<{ icon: React.ReactNode; label?: string }> = ({ icon, label }) => (
    <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all duration-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1">
        {icon}
    </button>
);

const ReadingProgressBar = () => {
    const [width, setWidth] = useState(0);

    const scrollHeight = () => {
        const el = document.documentElement;
        const ScrollTop = el.scrollTop || document.body.scrollTop;
        const ScrollHeight = el.scrollHeight || document.body.scrollHeight;
        const percent = (ScrollTop / (ScrollHeight - el.clientHeight)) * 100;
        setWidth(percent);
    };

    useEffect(() => {
        window.addEventListener('scroll', scrollHeight);
        return () => window.removeEventListener('scroll', scrollHeight);
    });

    return (
        <div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-gray-100 dark:bg-gray-800">
            <div 
                className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-100 ease-out" 
                style={{ width: `${width}%` }}
            ></div>
        </div>
    );
};

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, onNavigateHome, onNavigateToBlog }) => {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const loadPost = async () => {
            try {
                // Try API first
                const data = await api.getBlogPostBySlug(slug);
                if (data) {
                    setPost(data);
                    document.title = `${data.title} - Le Journal Beauté`;
                } else {
                    setPost(null);
                }
                
                // Load recent posts
                const allPosts = await api.getBlogPosts();
                if(allPosts) {
                    setRecentPosts(allPosts.filter((p: BlogPost) => p.slug !== slug).slice(0, 3));
                }
            } catch (e) {
                console.error(e);
            }
        };
        loadPost();
        window.scrollTo(0, 0);
    }, [slug]);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">Article introuvable</h1>
                <button 
                    onClick={onNavigateToBlog} 
                    className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                >
                    <ArrowLongLeftIcon className="w-5 h-5"/> Retour au journal
                </button>
            </div>
        );
    }
    
    // Estimation temps de lecture (simulé)
    const readTime = Math.max(1, Math.round((post.content || '').length / 500));

    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen font-sans selection:bg-rose-100 selection:text-rose-900">
            <ReadingProgressBar />

            {/* Hero Header Immersif */}
            <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
                <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="absolute inset-0 w-full h-full object-cover transform scale-105" // Léger zoom pour effet
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 backdrop-blur-[2px]"></div>
                
                <div className="absolute inset-0 flex flex-col justify-end pb-16 sm:pb-24">
                    <div className="max-w-4xl mx-auto px-6 text-center w-full">
                        <div className="flex justify-center items-center gap-2 mb-6 animate-fadeIn">
                            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                                {post.category}
                            </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-white mb-8 leading-tight tracking-tight drop-shadow-lg animate-fadeInUp">
                            {post.title}
                        </h1>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/90 text-sm font-light animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-3">
                                <img src={post.authorImageUrl} alt={post.author} className="w-10 h-10 rounded-full border-2 border-white/30 object-cover" />
                                <div className="text-left">
                                    <p className="font-bold text-white leading-none">{post.author}</p>
                                </div>
                            </div>
                            <div className="hidden sm:block w-px h-8 bg-white/20"></div>
                            <div className="flex gap-6">
                                <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4"/> {post.date}</span>
                                <span className="flex items-center gap-2"><ClockIcon className="w-4 h-4"/> {readTime} min de lecture</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Bouton retour absolu */}
                <div className="absolute top-8 left-8 z-20">
                    <button 
                        onClick={onNavigateToBlog}
                        className="group flex items-center gap-3 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                    >
                        <ArrowLongLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs font-bold uppercase tracking-wider">Retour</span>
                    </button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-10 z-10">
                <div className="bg-white dark:bg-gray-900 rounded-t-[2.5rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-16 lg:p-20 relative">
                    
                    {/* Share Floating Sidebar (Desktop) */}
                    <div className="hidden lg:flex flex-col gap-4 absolute left-8 top-20 sticky top-32">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 rotate-180 mb-4" style={{ writingMode: 'vertical-rl' }}>Partager</p>
                        <SocialShareButton icon={<FacebookIcon className="w-4 h-4"/>} />
                        <SocialShareButton icon={<TwitterIcon className="w-4 h-4"/>} />
                        <SocialShareButton icon={<InstagramIcon className="w-4 h-4"/>} />
                        <div className="w-px h-20 bg-gray-200 dark:bg-gray-700 mx-auto mt-4"></div>
                        <button 
                            onClick={() => setIsLiked(!isLiked)}
                            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 mt-2 ${isLiked ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-rose-500'}`}
                        >
                            <HeartIcon className="w-5 h-5" solid={isLiked} />
                        </button>
                    </div>

                    {/* Article Body */}
                    <article className="max-w-3xl mx-auto">
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-serif italic leading-relaxed mb-12 text-center border-b border-gray-100 dark:border-gray-800 pb-12">
                            "{post.excerpt}"
                        </p>

                        <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:font-medium prose-a:text-rose-600 prose-img:rounded-2xl max-w-none text-gray-700 dark:text-gray-300 font-light leading-loose">
                            {/* Affichage du contenu avec Drop Cap */}
                            <div className="first-letter:text-7xl first-letter:font-serif first-letter:font-bold first-letter:text-rose-900 dark:first-letter:text-rose-100 first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px]">
                                {post.content.split('\n\n').map((paragraph, index) => (
                                    <React.Fragment key={index}>
                                        <p className="mb-6">{paragraph}</p>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Author Box */}
                        <div className="mt-16 p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <img src={post.authorImageUrl} alt={post.author} className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white dark:border-gray-700" />
                            <div>
                                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">Écrit par</p>
                                <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">{post.author}</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-light text-sm leading-relaxed">
                                    Membre de la communauté Cosmetics Shop.
                                </p>
                            </div>
                        </div>
                    </article>
                </div>
            </div>

            {/* Read Next Section */}
            <section className="bg-gray-50 dark:bg-gray-950 py-20 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-rose-500 font-bold text-xs uppercase tracking-widest">Inspirations</span>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mt-2">À lire ensuite</h2>
                        </div>
                        <button onClick={onNavigateToBlog} className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-rose-600 transition-colors">
                            Voir tout le journal <ArrowLongLeftIcon className="w-4 h-4 rotate-180" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {recentPosts.map(recent => (
                            <a 
                                key={recent.id} 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); }} 
                                className="group block"
                            >
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-md">
                                    <img 
                                        src={recent.imageUrl} 
                                        alt={recent.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                </div>
                                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">{recent.category}</span>
                                <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mt-2 mb-3 leading-snug group-hover:text-rose-600 transition-colors">
                                    {recent.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{recent.excerpt}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
