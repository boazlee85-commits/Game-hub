import React, { useState, useEffect } from 'react';
import { gameStorage } from '@/lib/gameStorage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Send, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Ideas() {
  const [newIdea, setNewIdea] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load ideas from localStorage
    const loadedIdeas = gameStorage.getIdeasSorted('-created_date');
    setIdeas(loadedIdeas);
    setIsLoading(false);
  }, []);

  const handlePost = () => {
    if (!newIdea.trim()) return;
    try {
      const savedIdea = gameStorage.saveIdea({
        text: newIdea.trim(),
        posted_by: 'Anonymous',
      });
      setIdeas(prev => [savedIdea, ...prev]);
      setNewIdea('');
      toast.success('Idea posted!');
    } catch (error) {
      toast.error('Failed to post idea');
    }
  };

  const handleLike = (ideaId) => {
    try {
      const userId = 'anonymous'; // Since no auth
      const idea = ideas.find(i => i.id === ideaId);
      if (!idea) return;

      const isLiked = idea.liked_by?.includes(userId);
      const newLikedBy = isLiked
        ? idea.liked_by.filter(id => id !== userId)
        : [...(idea.liked_by || []), userId];
      const newLikes = newLikedBy.length;

      gameStorage.updateIdea(ideaId, { liked_by: newLikedBy, likes: newLikes });
      setIdeas(prev => prev.map(i =>
        i.id === ideaId ? { ...i, liked_by: newLikedBy, likes: newLikes } : i
      ));
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          Your Ideas for Games
        </h1>
        <p className="text-muted-foreground mt-2">Share your game ideas and vote on others</p>
      </div>

      {/* Post new idea */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <Textarea
          placeholder="Describe your game idea..."
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          className="min-h-24 bg-background border-border rounded-xl resize-none text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
        <div className="flex justify-end">
          <Button
            onClick={handlePost}
            disabled={!newIdea.trim()}
            className="rounded-xl gap-2 bg-primary text-primary-foreground hover:opacity-90"
          >
            <Send className="w-4 h-4" />
            Post Idea
          </Button>
        </div>
      </div>

      {/* Ideas list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Lightbulb className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">No ideas yet</p>
          <p className="text-muted-foreground text-sm mt-1">Be the first to share one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {ideas.map((idea) => {
              const liked = (idea.liked_by || []).includes('anonymous');
              return (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card border border-border rounded-2xl p-5 flex gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground leading-relaxed">{idea.text}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      by {idea.posted_by || 'Anonymous'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLike(idea.id)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                      liked
                        ? 'text-destructive bg-destructive/10'
                        : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">{idea.likes || 0}</span>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}