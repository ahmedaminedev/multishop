
import React, { useEffect, useState } from 'react';
import type { BlogPost } from '../types';
import { CalendarIcon, FacebookIcon, TwitterIcon, InstagramIcon, ArrowLongLeftIcon, ClockIcon } from './IconComponents';
import { api } from '../utils/api';

interface BlogPostPageProps {
    slug: string;
    onNavigateHome: () => void;
    onNavigateToBlog: () => void;
}

const SocialShareButton: React.FC<{ icon: React.ReactNode; label?: string }> = ({ icon, label }) => (
    <button className="w-12 h-12 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-brand-neon hover:border-brand-neon transition-all transform -skew-x-12 shadow-sm">
        <div className="skew-x-12">{icon}</div>
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
        <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-gray-100 dark:bg-gray-900">
            <div 
                className="h-full bg-brand-neon shadow-[0_0_10px_#ccff00] transition-all duration-100 ease-out" 
                style={{ width: `${width}%` }}
            ></div>
        </div>
    );
};

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, onNavigateHome, onNavigateToBlog }) => {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        const loadPost = async () => {
            try {
                const data = await api.getBlogPostBySlug(slug);
                if (data) {
                    setPost(data);
                    document.title = `${data.title} - IRON HUB`;
                }
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
                <h1 className="text-4xl font-serif font-black italic text-gray-900 dark:text-white mb-8">DOSSIER NON TROUVÉ</h1>
                <button 
                    onClick={onNavigateToBlog} 
                    className="flex items-center gap-3 text-brand-neon font-black uppercase tracking-widest text-sm hover:text-black dark:hover:text-white transition-colors"
                >
                    <ArrowLongLeftIcon className="w-5 h-5"/> Retour à la base
                </button>
            </div>
        );
    }
    
    const readTime = Math.max(1, Math.round((post.content || '').length / 500));

    return (
        <div className="bg-gray-50 dark:bg-[#050505] min-h-screen font-sans selection:bg-brand-neon selection:text-black transition-colors duration-300">
            <ReadingProgressBar />

            {/* Hero Image Section */}
            <div className="relative h-[70vh] min-h-[600px] w-full overflow-hidden">
                <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#050505] via-transparent to-transparent"></div>
                
                <div className="absolute inset-0 flex flex-col justify-end pb-24">
                    <div className="max-w-6xl mx-auto px-6 w-full text-center">
                        <span className="inline-block bg-brand-neon text-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] mb-8 transform -skew-x-12 shadow-lg">
                            <span className="skew-x-12 inline-block">{post.category}</span>
                        </span>
                        
                        <h1 className="text-5xl md:text-8xl lg:text-9xl font-serif font-black italic text-white mb-8 leading-[0.8] uppercase tracking-tighter drop-shadow-2xl">
                            {post.title}
                        </h1>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 text-white font-mono text-[10px] uppercase tracking-widest bg-black/60 dark:bg-black/80 backdrop-blur-md p-6 border border-white/10 w-fit mx-auto mt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 border border-gray-700 p-0.5">
                                    <img src={post.authorImageUrl} alt={post.author} className="w-full h-full object-cover filter grayscale" />
                                </div>
                                <span className="font-bold text-brand-neon">{post.author}</span>
                            </div>
                            <span className="hidden sm:block w-px h-6 bg-gray-700"></span>
                            <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-gray-400"/> {post.date}</span>
                            <span className="flex items-center gap-2"><ClockIcon className="w-4 h-4 text-gray-400"/> {readTime} min read</span>
                        </div>
                    </div>
                </div>
                
                <div className="absolute top-8 left-8 z-20">
                    <button 
                        onClick={onNavigateToBlog}
                        className="group flex items-center gap-3 text-white/70 hover:text-brand-neon transition-colors"
                    >
                        <div className="w-10 h-10 border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center group-hover:border-brand-neon transition-colors">
                            <ArrowLongLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] drop-shadow-lg">Back to Hub</span>
                    </button>
                </div>
            </div>

            {/* Article Content Layout */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-10 z-10">
                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-8 md:p-16 lg:p-24 relative shadow-2xl">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-neon"></div>
                    
                    {/* Share Floating Sidebar */}
                    <div className="hidden xl:flex flex-col gap-2 absolute -left-16 top-24">
                        <SocialShareButton icon={<FacebookIcon className="w-4 h-4"/>} />
                        <SocialShareButton icon={<TwitterIcon className="w-4 h-4"/>} />
                        <SocialShareButton icon={<InstagramIcon className="w-4 h-4"/>} />
                    </div>

                    <article className="max-w-3xl mx-auto">
                        <p className="text-xl md:text-2xl text-gray-900 dark:text-white font-mono uppercase tracking-wide leading-relaxed mb-16 border-b border-gray-100 dark:border-gray-900 pb-16 italic opacity-80">
                            {post.excerpt}
                        </p>

                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-400 font-mono text-sm leading-loose space-y-10">
                             {post.content.split('\n\n').map((paragraph, index) => (
                                <p key={index} className="mb-6 first-letter:text-4xl first-letter:font-serif first-letter:font-black first-letter:text-brand-neon first-letter:mr-2 first-letter:float-left first-letter:mt-1">
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        {/* Author Credentials */}
                        <div className="mt-24 p-10 bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-900 flex flex-col md:flex-row items-center gap-10">
                            <div className="w-24 h-24 border-2 border-brand-neon p-1 flex-shrink-0">
                                <img src={post.authorImageUrl} alt={post.author} className="w-full h-full object-cover filter grayscale" />
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black text-brand-neon uppercase tracking-[0.4em] mb-2">Author Credential</p>
                                <h3 className="text-2xl font-serif font-black italic text-gray-900 dark:text-white uppercase mb-4">{post.author}</h3>
                                <p className="text-gray-500 font-mono text-xs leading-relaxed uppercase">
                                    Analyste Performance & Coach certifié. Membre du comité de débriefing technique IronFuel.
                                </p>
                            </div>
                        </div>
                    </article>
                </div>
            </div>

            {/* Next Missions Section */}
            <section className="bg-white dark:bg-black py-32 border-t border-gray-100 dark:border-gray-900">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-16 px-4">
                        <div>
                            <span className="text-brand-neon font-black text-[10px] uppercase tracking-[0.3em]">Operational Intel</span>
                            <h2 className="text-4xl md:text-5xl font-serif font-black italic text-gray-900 dark:text-white mt-2 uppercase tracking-tighter">Next Reports</h2>
                        </div>
                        <button onClick={onNavigateToBlog} className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-neon transition-colors">
                            Explore All <ArrowLongLeftIcon className="w-5 h-5 rotate-180" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {recentPosts.map(recent => (
                            <a 
                                key={recent.id} 
                                href={`#/blog-post/${recent.slug}`}
                                onClick={(e) => { e.preventDefault(); window.location.hash = `#/blog/${recent.slug}`; }} 
                                className="group block"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden mb-6 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                    <img 
                                        src={recent.imageUrl} 
                                        alt={recent.title} 
                                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/5 dark:bg-black/40 group-hover:bg-transparent"></div>
                                </div>
                                <span className="text-[9px] font-black text-brand-neon uppercase tracking-widest">{recent.category}</span>
                                <h3 className="text-xl font-serif font-black italic text-gray-900 dark:text-white mt-2 mb-4 leading-none uppercase tracking-tighter group-hover:text-brand-neon transition-colors">
                                    {recent.title}
                                </h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-600 font-mono line-clamp-2 uppercase">{recent.excerpt}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
