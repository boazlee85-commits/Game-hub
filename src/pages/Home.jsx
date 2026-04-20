import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Swords, BookOpen, Cpu, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Swords className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-foreground mb-3">
          Stratego
        </h1>
        <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
          The classic game of battlefield strategy. Outsmart your opponent, capture the flag, and lead your army to victory.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link to="/play">
            <Button size="lg" className="gap-2 px-8 font-semibold w-full sm:w-auto">
              <Cpu className="w-5 h-5" />
              Play vs AI
            </Button>
          </Link>
          <Link to="/lobby">
            <Button size="lg" variant="secondary" className="gap-2 px-8 font-semibold w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              <Users className="w-5 h-5" />
              Play Online
            </Button>
          </Link>
          <Link to="/rules">
            <Button size="lg" variant="outline" className="gap-2 px-8 font-semibold w-full sm:w-auto">
              <BookOpen className="w-5 h-5" />
              Learn Rules
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: '40 Pieces', desc: 'Per player' },
            { label: '12 Ranks', desc: 'From Spy to Marshal' },
            { label: '10×10', desc: 'Board size' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
              <p className="text-lg font-bold text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}