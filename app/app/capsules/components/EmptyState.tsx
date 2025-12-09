import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EmptyState() {
  return (
    <div className="flex items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Card className="border-2 border-border/50 shadow-2xl backdrop-blur-xl bg-card/95 max-w-md w-full">
          <CardContent className="pt-8 pb-8">
            <Sparkles className="w-20 h-20 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Capsules Yet</h2>
            <p className="text-muted-foreground mb-6">
              Be the first to create a time capsule!
            </p>
            <Link href="/create">
              <Button size="lg" className="w-full">
                <Sparkles className="h-5 w-5 mr-2" />
                Create Your First Capsule
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

