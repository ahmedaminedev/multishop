import React from 'react';
import { BlogPost } from '../types';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

interface BlogPageProps {
  blogPosts: BlogPost[];
}

export const BlogPage: React.FC<BlogPageProps> = ({ blogPosts }) => {
  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            MAGAZINE & ART DE VIVRE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-serif">
            Conseils Déco & Inspirations Maison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Retrouvez les tendances, les astuces d'agencement et les secrets des plus beaux intérieurs tunisiens et contemporains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md flex flex-col group cursor-pointer"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  <span>{post.date}</span>
                </span>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif group-hover:text-indigo-600 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Lire l'article complet</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};
