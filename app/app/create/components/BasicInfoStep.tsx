'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { FormData } from '../types';
import { slideVariants } from '../constants';
import { CAPSULE_CATEGORIES } from '@/lib/solana/constants';
import { Upload } from 'lucide-react';

interface BasicInfoStepProps {
  direction: number;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

const MAX_FILE_SIZE = 200 * 1024; // 200KB

export default function BasicInfoStep({
  direction,
  register,
  errors,
}: BasicInfoStepProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > MAX_FILE_SIZE) {
        setFileError(
          `File size (${(file.size / 1024).toFixed(1)}KB) exceeds 200KB limit`
        );
        e.target.value = ''; // Clear the file input
      } else {
        setFileError(null);
      }
    } else {
      setFileError(null);
    }
  };
  return (
    <motion.div
      key="step-1"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="space-y-6 relative w-full"
    >
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-semibold">
          Capsule Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="My amazing time capsule"
          {...register('title', {
            required: 'Title is required',
            minLength: {
              value: 3,
              message: 'Title must be at least 3 characters',
            },
          })}
          className={`h-12 border-2 transition-all duration-200 ${
            errors.title
              ? 'border-destructive focus:ring-destructive/20'
              : 'border-border/60 focus:border-primary/50 focus:ring-primary/20'
          }`}
        />
        <AnimatePresence>
          {errors.title && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-destructive"
            >
              {errors.title.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Share your thoughts, memories, or messages for the future..."
          rows={4}
          {...register('description', {
            required: 'Description is required',
            minLength: {
              value: 10,
              message: 'Description must be at least 10 characters',
            },
          })}
          className={`border-2 resize-none transition-all duration-200 ${
            errors.description
              ? 'border-destructive focus:ring-destructive/20'
              : 'border-border/60 focus:border-primary/50 focus:ring-primary/20'
          }`}
        />
        <AnimatePresence>
          {errors.description && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-destructive"
            >
              {errors.description.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-semibold">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          id="category"
          {...register('category', {
            required: 'Category is required',
          })}
          className={`h-12 border-2 transition-all duration-200 ${
            errors.category
              ? 'border-destructive focus:ring-destructive/20'
              : 'border-border/60 focus:border-primary/50 focus:ring-primary/20'
          }`}
        >
          <option value="">Select a category</option>
          {CAPSULE_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <AnimatePresence>
          {errors.category && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-destructive"
            >
              {errors.category.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file" className="text-sm font-semibold">
          Attach Image (Optional)
        </Label>
        <div className="relative flex items-center">
          <Input
            id="file"
            type="file"
            accept="image/*"
            {...register('file')}
            onChange={handleFileChange}
            className={`h-12 border-2 transition-all duration-200 pr-10 file:h-full file:mr-4 file:py-0 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer ${
              fileError
                ? 'border-destructive focus:ring-destructive/20'
                : 'border-border/60 focus:border-primary/50 focus:ring-primary/20'
            }`}
          />
          <Upload className="absolute right-3 h-5 w-5 text-muted-foreground pointer-events-none" />
        </div>
        <AnimatePresence>
          {fileError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-destructive"
            >
              {fileError}
            </motion.p>
          )}
        </AnimatePresence>
        <p className="text-xs text-muted-foreground">
          Accepts images only (PNG, JPG, GIF, etc.). Max size: 200KB
        </p>
      </div>
    </motion.div>
  );
}
