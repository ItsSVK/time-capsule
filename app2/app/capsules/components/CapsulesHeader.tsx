import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CapsulesHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Time Capsules
          </h1>
          <p className="text-muted-foreground">
            Discover and explore time capsules from the community
          </p>
        </div>
        <Link href="/create">
          <Button size="lg" className="gap-2">
            <Sparkles className="h-5 w-5" />
            Create Capsule
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

