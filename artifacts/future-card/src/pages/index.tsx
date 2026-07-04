import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Heart, Star } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>A magical keepsake for your child</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-tight tracking-tight">
              {t('hero.title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/create">
              <Button size="lg" className="rounded-full h-16 px-10 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                {t('hero.cta')}
                <Star className="ml-2 w-5 h-5 fill-current opacity-70" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium">AI Magic</h3>
              <p className="text-muted-foreground">Transform their photo into a beautiful future vision.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium">Eternal Voice</h3>
              <p className="text-muted-foreground">Leave a voice message they can listen to forever.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center mx-auto mb-4">
                <div className="font-serif text-2xl font-bold">QR</div>
              </div>
              <h3 className="font-serif text-xl font-medium">Physical Keepsake</h3>
              <p className="text-muted-foreground">Print and share via QR code with family.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
