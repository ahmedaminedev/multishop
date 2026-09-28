
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

const CategoryPill: React.FC<{ label: string, isActive?: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
            isActive 
            ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200 dark:shadow-none' 
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-rose-300 hover:text-rose-500'
        }`}
    >
        {label}
    </button>
);

const FeaturedPost: React.FC<{ post: BlogPost; onSelectPost: (slug: string) => void; }> = ({ post, onSelectPost }) => {
    return (
        <article className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center mb-24 group cursor-pointer" onClick={() => onSelectPost(post.slug)}>
            {/* Image Side */}
            <div className="relative h-[500px] lg:h-[600px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
                <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
                
                <div className="absolute top-6 left-6">
                    <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-900 dark:text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                        À la une
                    </span>
                </div>
            </div>

            {/* Content Side (Overlapping Card on Desktop) */}
            <div className="lg:-ml-24 relative z-10 p-4">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-xl border border-rose-50 dark:border-gray-700 transition-transform duration-500 group-hover:-translate-y-2">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-rose-500 font-bold uppercase tracking-wider text-xs">{post.category}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3"/> {post.date}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-serif font-medium text-gray-900 dark:text-white mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <p className="text-gray-500 dark:text-gray-400 font-light text-lg mb-8 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
                        <div className="flex items-center gap-3">
                            <img src={post.authorImageUrl} alt={post.author} className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-100 dark:ring-gray-600" />
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{post.author}</p>
                                <p className="text-xs text-gray-400">Contributeur</p>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-gray-700 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                            <ArrowUpRightIcon className="w-5 h-5" />
                        </div>
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
            className="group cursor-pointer flex flex-col h-full"
        >
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] mb-6 shadow-md">
                <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <ArrowUpRightIcon className="w-5 h-5 text-rose-500" />
                </div>
            </div>
            
            <div className="flex flex-col flex-grow px-2">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">{post.category}</span>
                    <span className="text-xs text-gray-400">{post.date}</span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-serif font-medium text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-rose-600 transition-colors">
                    {post.title}
                </h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed line-clamp-2 mb-4">
                    {post.excerpt}
                </p>

                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                    <img src={post.authorImageUrl} alt={post.author} className="w-6 h-6 rounded-full grayscale group-hover:grayscale-0 transition-all object-cover" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Par {post.author}</span>
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
        document.title = `Le Journal - Cosmetics Shop`;
        window.scrollTo(0,0);
        setIsLoggedIn(!!localStorage.getItem('token'));

        // Load posts from API
        const loadPosts = async () => {
            try {
                const posts = await api.getBlogPosts();
                if (posts && posts.length > 0) {
                    setBlogPosts(posts);
                } else {
                    setBlogPosts([]);
                }
            } catch (err) {
                console.error(err);
                setBlogPosts([]);
            }
        };
        loadPosts();
    }, []);
    
    // Extraire les catégories uniques
    const categories = useMemo(() => ['Tous', ...new Set(blogPosts.map(p => p.category))], [blogPosts]);

    // Filtrer les posts
    const filteredPosts = useMemo(() => {
        if (selectedCategory === 'Tous') return blogPosts;
        return blogPosts.filter(p => p.category === selectedCategory);
    }, [selectedCategory, blogPosts]);

    const [featuredPost, ...otherPosts] = filteredPosts;

    const handleCreatePost = async (postData: any) => {
        try {
            const newPost = await api.createBlogPost(postData);
            setBlogPosts(prev => [newPost, ...prev]);
            addToast("Votre article a été publié avec succès !", "success");
        } catch (error) {
            console.error(error);
            addToast("Erreur lors de la publication de l'article.", "error");
        }
    };

    return (
        <div className="bg-[#FAFAFA] dark:bg-gray-950 min-h-screen font-sans">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                
                {/* Header Élégant */}
                <div className="text-center max-w-3xl mx-auto mb-20 relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-rose-200/30 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                        <SparklesIcon className="w-3 h-3" />
                        Éditorial & Conseils
                    </span>
                    
                    <h1 className="text-5xl md:text-7xl font-serif text-gray-900 dark:text-white mb-6 leading-tight">
                        Le Journal <span className="italic text-rose-500">Beauté</span>
                    </h1>
                    
                    <p className="text-gray-500 dark:text-gray-400 font-light text-lg md:text-xl leading-relaxed mb-8">
                        L'art de prendre soin de soi. Découvrez nos dossiers exclusifs, les tendances maquillage décryptées et les secrets de nos experts.
                    </p>

                    {isLoggedIn && (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs tracking-widest py-4 px-10 rounded-full hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                        >
                            <PencilIcon className="w-4 h-4" />
                            <span>Rédiger un article</span>
                        </button>
                    )}
                </div>

                {/* Filtres Catégories */}
                <div className="flex flex-wrap justify-center gap-3 mb-16 sticky top-20 z-20 py-4 bg-[#FAFAFA]/80 dark:bg-gray-950/80 backdrop-blur-sm">
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
                <div className="animate-fade-in-up">
                    {featuredPost ? (
                        <>
                            <FeaturedPost post={featuredPost} onSelectPost={onSelectPost} />
                            
                            {otherPosts.length > 0 && (
                                <div className="mt-24">
                                    <div className="flex items-end justify-between mb-12 px-2">
                                        <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Derniers Articles</h2>
                                        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow ml-8 mb-2"></div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                                        {otherPosts.map(post => (
                                            <BlogCard key={post.id} post={post} onSelectPost={onSelectPost} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-500 italic">Aucun article dans cette catégorie pour le moment.</p>
                        </div>
                    )}
                </div>

                {/* Newsletter Section */}
                <div className="mt-32 relative rounded-[3rem] overflow-hidden bg-gray-900 dark:bg-rose-950 text-white">
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                    <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-rose-600 rounded-full filter blur-[100px] opacity-30"></div>
                    <div className="absolute top-10 right-10 w-40 h-40 bg-purple-500 rounded-full filter blur-[80px] opacity-20"></div>

                    <div className="relative z-10 px-8 py-20 md:p-24 text-center max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
                            Rejoignez le cercle <br/><span className="italic text-rose-300">privé</span>
                        </h2>
                        <p className="text-gray-300 font-light text-lg mb-10 max-w-xl mx-auto">
                            Recevez nos conseils d'experts, des invitations à nos ventes privées et votre dose hebdomadaire d'inspiration beauté.
                        </p>

                        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input 
                                type="email" 
                                placeholder="Votre adresse e-mail" 
                                className="flex-grow px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white/20 transition-all"
                            />
                            <button className="px-10 py-4 bg-rose-600 text-white font-bold uppercase tracking-widest text-xs rounded-full hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/30 transition-all transform hover:-translate-y-1">
                                S'inscrire
                            </button>
                        </form>
                        <p className="text-white/40 text-xs mt-6">En vous inscrivant, vous acceptez notre politique de confidentialité.</p>
                    </div>
                </div>

            </div>

            {/* Modal de Création */}
            <CreateBlogModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSave={handleCreatePost} 
            />
        </div>
    );
};
