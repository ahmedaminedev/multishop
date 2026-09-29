
import React, { useEffect, useMemo, useState } from 'react';
import type { BlogPost } from '../types';
import { CalendarIcon, ArrowUpRightIcon, SparklesIcon, PencilIcon } from './IconComponents';
import { CreateBlogModal } from './CreateBlogModal';
import { api } from '../utils/api';
import { useToast } from './ToastContext';

interface BlogPageProps {
    onNavigateHome: () => void;
    onSelectPost: (slug: string) => void;
}

const CategoryPill: React.FC<{ label: string; isActive?: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-6 py-2 transition-all duration-300 transform skew-x-[-12deg] border-2 font-black uppercase text-[10px] tracking-[0.2em] ${
            isActive 
            ? 'bg-brand-neon text-black border-brand-neon shadow-[0_0_15px_rgba(204,255,0,0.3)]' 
            : 'bg-transparent text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
        }`}
    >
        <span className="inline-block skew-x-[12deg]">{label}</span>
    </button>
);

const FeaturedPost: React.FC<{ post: BlogPost; onSelectPost: (slug: string) => void; }> = ({ post, onSelectPost }) => {
    return (
        <article className="relative grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch mb-24 group cursor-pointer border border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden shadow-2xl" onClick={() => onSelectPost(post.slug)}>
            {/* Image Side */}
            <div className="relative h-[500px] lg:h-[700px] w-full overflow-hidden">
                <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-black via-transparent to-transparent opacity-40"></div>
                <div className="absolute top-8 left-8">
                    <span className="bg-brand-neon text-black px-4 py-1 font-black uppercase tracking-widest text-[10px] transform -skew-x-12 inline-block">
                        <span className="skew-x-12 inline-block">À LA UNE</span>
                    </span>
                </div>
            </div>

            {/* Content Side */}
            <div className="flex flex-col justify-center p-8 md:p-16 lg:p-20 relative bg-white dark:bg-black">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-neon"></div>
                
                <div className="flex items-center gap-3 mb-8">
                    <span className="text-brand-neon font-black uppercase tracking-widest text-xs">{post.category}</span>
                    <span className="w-8 h-px bg-gray-200 dark:bg-gray-800"></span>
                    <span className="text-gray-400 dark:text-gray-500 text-[10px] font-mono uppercase">
                        {post.date}
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-serif font-black italic text-gray-900 dark:text-white mb-8 leading-[0.85] uppercase tracking-tighter">
                    {post.title}
                </h1>

                <p className="text-gray-600 dark:text-gray-400 font-mono text-base mb-12 line-clamp-4 leading-relaxed border-l-2 border-gray-100 dark:border-gray-800 pl-6">
                    {post.excerpt}
                </p>

                <div className="flex items-center justify-between mt-auto pt-10 border-t border-gray-100 dark:border-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1">
                            <img src={post.authorImageUrl} alt={post.author} className="w-full h-full object-cover filter grayscale" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Posté par</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{post.author}</p>
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center group-hover:bg-brand-neon group-hover:text-black transition-colors transform -skew-x-12 shadow-lg">
                        <ArrowUpRightIcon className="w-6 h-6 skew-x-12" />
                    </div>
                </div>
            </div>
        </article>
    );
};

const BlogCard: React.FC<{ post: BlogPost; onSelectPost: (slug: string) => void; }> = ({ post, onSelectPost }) => {
    return (
        <article 
            onClick={() => onSelectPost(post.slug)}
            className="group cursor-pointer flex flex-col h-full bg-white dark:bg-transparent border border-gray-100 dark:border-gray-900 hover:border-brand-neon transition-colors duration-300 shadow-sm hover:shadow-xl"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-900">
                <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-black/5 dark:bg-black/20 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute bottom-0 left-0 bg-brand-neon text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest transform -skew-x-12 m-4 opacity-0 group-hover:opacity-100 transition-all">
                    <span className="skew-x-12 inline-block">Lire le dossier</span>
                </div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black text-brand-neon uppercase tracking-[0.2em]">{post.category}</span>
                    <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600">/ {post.date}</span>
                </div>
                
                <h3 className="text-2xl font-serif font-black italic text-gray-900 dark:text-white mb-4 leading-none uppercase tracking-tighter group-hover:text-brand-neon transition-colors">
                    {post.title}
                </h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono leading-relaxed line-clamp-3 mb-6">
                    {post.excerpt}
                </p>

                <div className="mt-auto flex items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-900">
                    <img src={post.authorImageUrl} alt={post.author} className="w-6 h-6 object-cover filter grayscale" />
                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">Par {post.author}</span>
                </div>
            </div>
        </article>
    );
};

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigateHome, onSelectPost }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const { addToast } = useToast();

    useEffect(() => {
        document.title = `IRON HUB - Communauté IronFuel`;
        window.scrollTo(0,0);
        setIsLoggedIn(!!localStorage.getItem('token'));

        const loadPosts = async () => {
            try {
                const posts = await api.getBlogPosts();
                setBlogPosts(posts || []);
            } catch (err) {
                console.error(err);
                setBlogPosts([]);
            }
        };
        loadPosts();
    }, []);
    
    const categories = useMemo(() => ['Tous', ...new Set(blogPosts.map(p => p.category))], [blogPosts]);

    const filteredPosts = useMemo(() => {
        if (selectedCategory === 'Tous') return blogPosts;
        return blogPosts.filter(p => p.category === selectedCategory);
    }, [selectedCategory, blogPosts]);

    const [featuredPost, ...otherPosts] = filteredPosts;

    const handleCreatePost = async (postData: any) => {
        try {
            const newPost = await api.createBlogPost(postData);
            setBlogPosts(prev => [newPost, ...prev]);
            addToast("Débriefing publié !", "success");
        } catch (error) {
            addToast("Erreur de transmission.", "error");
        }
    };

    return (
        <div className="bg-white dark:bg-[#050505] min-h-screen font-sans selection:bg-brand-neon selection:text-black transition-colors duration-300">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                {/* Header Industriel */}
                <div className="text-center max-w-4xl mx-auto mb-32 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-[15vw] font-black text-black/[0.02] dark:text-white/[0.03] pointer-events-none select-none italic font-serif">
                        IRON HUB
                    </div>
                    
                    <span className="inline-flex items-center gap-3 px-4 py-1 border border-brand-neon/30 bg-brand-neon/5 text-brand-neon text-[10px] font-black uppercase tracking-[0.3em] mb-8 transform -skew-x-12">
                        <SparklesIcon className="w-4 h-4 skew-x-12" />
                        Intelligence Athlétique
                    </span>
                    
                    <h1 className="text-6xl md:text-9xl font-serif font-black italic text-gray-900 dark:text-white mb-8 leading-[0.8] uppercase tracking-tighter">
                        THE <span className="text-brand-neon">IRON</span> FEED
                    </h1>
                    
                    <p className="text-gray-500 dark:text-gray-500 font-mono text-sm md:text-base leading-relaxed max-w-2xl mx-auto uppercase tracking-wide">
                        Décryptage nutritionnel, protocoles d'entraînement et coulisses de l'élite IronFuel.
                    </p>

                    {isLoggedIn && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-12 inline-flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-widest py-5 px-12 transform -skew-x-12 hover:bg-brand-neon transition-all shadow-xl hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                        >
                            <span className="skew-x-12 flex items-center gap-2">
                                <PencilIcon className="w-4 h-4" />
                                Transmettre un rapport
                            </span>
                        </button>
                    )}
                </div>

                {/* Filtres Catégories - Navigation de Combat */}
                <div className="flex flex-wrap justify-center gap-4 mb-20 sticky top-20 z-20 py-6 bg-white/80 dark:bg-black/80 backdrop-blur-md border-y border-gray-100 dark:border-gray-900">
                    {categories.map(cat => (
                        <CategoryPill 
                            key={cat} 
                            label={cat} 
                            isActive={selectedCategory === cat} 
                            onClick={() => setSelectedCategory(cat)} 
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="animate-fadeIn">
                    {featuredPost ? (
                        <>
                            <FeaturedPost post={featuredPost} onSelectPost={onSelectPost} />
                            
                            {otherPosts.length > 0 && (
                                <div className="mt-32">
                                    <div className="flex items-center gap-6 mb-16">
                                        <h2 className="text-4xl font-serif font-black italic text-gray-900 dark:text-white uppercase tracking-tighter">Derniers Drops</h2>
                                        <div className="h-0.5 bg-gray-100 dark:bg-gray-900 flex-grow"></div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {otherPosts.map(post => (
                                            <BlogCard key={post.id} post={post} onSelectPost={onSelectPost} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-32 border border-dashed border-gray-200 dark:border-gray-800">
                            <p className="text-gray-400 dark:text-gray-600 font-mono uppercase tracking-widest italic">Signal perdu... Aucun rapport disponible.</p>
                        </div>
                    )}
                </div>

                {/* Training Club Section */}
                <div className="mt-40 relative overflow-hidden bg-gray-50 dark:bg-[#080808] border-t-4 border-brand-neon">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 dark:opacity-10"></div>
                    
                    <div className="relative z-10 px-8 py-24 text-center max-w-5xl mx-auto">
                        <h2 className="text-5xl md:text-7xl font-serif font-black italic text-gray-900 dark:text-white mb-8 leading-none uppercase tracking-tighter">
                            JOIN THE <span className="text-brand-neon">ELITE</span> CLUB
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mb-12 max-w-xl mx-auto uppercase tracking-widest">
                            Recevez vos ordres de mission hebdomadaires : offres privées, routines pro et accès anticipé aux nouveaux drops.
                        </p>

                        <form className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
                            <input 
                                type="email" 
                                placeholder="ADRESSE_EMAIL@HQ.COM" 
                                className="flex-grow px-6 py-5 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:border-brand-neon transition-all placeholder:text-gray-400 dark:placeholder:text-gray-700"
                            />
                            <button className="px-10 py-5 bg-black dark:bg-brand-neon text-white dark:text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-neon dark:hover:bg-white transition-all transform sm:-translate-x-1 shadow-2xl">
                                REJOINDRE
                            </button>
                        </form>
                    </div>
                </div>

            </div>

            <CreateBlogModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSave={handleCreatePost} 
            />
        </div>
    );
};
