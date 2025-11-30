"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCapsuleActions } from "@/hooks/useCapsules";
import { uploadImage, uploadMetadata } from "@/lib/pinata";
import { Button } from "@/components/ui/button";
import { CAPSULE_CATEGORIES, VOTING_DURATION_OPTIONS } from "@/lib/solana/constants";
import { StakeDestination } from "@/lib/solana/types";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  Loader2,
  Upload,
  Calendar,
  Clock,
  Coins,
  Users,
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function CreateCapsulePage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { createCapsule, addStake } = useCapsuleActions();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CAPSULE_CATEGORIES[0]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [openDate, setOpenDate] = useState("");
  const [openTime, setOpenTime] = useState("12:00");
  const [votingDuration, setVotingDuration] = useState(172800); // 48 hours default
  const [quorum, setQuorum] = useState(1);
  const [enableStake, setEnableStake] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeDestination, setStakeDestination] = useState<StakeDestination>(StakeDestination.ReturnToCreator);

  // UI state
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"creating" | "staking" | "complete">("creating");
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStep("creating");

      // Calculate open timestamp
      const openDateTime = new Date(`${openDate}T${openTime}`);
      const openTimestamp = Math.floor(openDateTime.getTime() / 1000);

      if (openTimestamp <= Math.floor(Date.now() / 1000)) {
        throw new Error("Open date must be in the future");
      }

      // Upload image if provided
      let imageUri: string | undefined;
      if (image) {
        imageUri = await uploadImage(image);
      }

      // Create metadata
      const metadata = {
        name: title,
        description,
        image: imageUri,
        category,
        attributes: [
          { trait_type: "Category", value: category },
          { trait_type: "Open Date", value: openDateTime.toISOString() },
          { trait_type: "Voting Duration", value: `${votingDuration / 3600} hours` },
          { trait_type: "Quorum", value: quorum },
        ],
      };

      // Upload metadata to Pinata
      const metadataUri = await uploadMetadata(metadata);

      // Create capsule on-chain
      const symbol = "TCAP";
      const { tx, capsulePda } = await createCapsule(
        metadataUri,
        openTimestamp,
        votingDuration,
        quorum,
        title.slice(0, 32),
        symbol
      );

      console.log("Capsule created:", tx);

      // Add stake if enabled
      if (enableStake && stakeAmount && parseFloat(stakeAmount) > 0) {
        setStep("staking");
        const lamports = Math.floor(parseFloat(stakeAmount) * LAMPORTS_PER_SOL);
        await addStake(capsulePda, lamports, stakeDestination);
      }

      setStep("complete");
      
      // Redirect to capsule page
      setTimeout(() => {
        router.push(`/capsule/${capsulePda.toBase58()}`);
      }, 1500);
    } catch (err) {
      console.error("Failed to create capsule:", err);
      setError(err instanceof Error ? err.message : "Failed to create capsule");
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Required</h2>
          <p className="text-zinc-400 mb-6">Please connect your wallet to create a capsule</p>
          <Link href="/">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Time Capsule</h1>
          <p className="text-zinc-400">
            Lock your prediction, goal, or commitment. Set a future date and let the community vote.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              Capsule Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Bitcoin will reach $100k"
                  required
                  maxLength={64}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your prediction, goal, or commitment..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-violet-500 transition-colors"
                >
                  {CAPSULE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Image (Optional)
                </label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImage(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-violet-500 transition-colors">
                      <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                      <span className="text-zinc-500">Click to upload image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-400" />
              Timing
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Open Date *
                </label>
                <input
                  type="date"
                  value={openDate}
                  onChange={(e) => setOpenDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-violet-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Open Time *
                </label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Voting Duration
              </label>
              <select
                value={votingDuration}
                onChange={(e) => setVotingDuration(Number(e.target.value))}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-violet-500 transition-colors"
              >
                {VOTING_DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Quorum (Minimum Votes)
              </label>
              <input
                type="number"
                value={quorum}
                onChange={(e) => setQuorum(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Stake */}
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              Accountability Stake (Optional)
            </h2>
            
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={enableStake}
                onChange={(e) => setEnableStake(e.target.checked)}
                className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-violet-500 focus:ring-violet-500"
              />
              <span className="text-zinc-300">Add stake for accountability</span>
            </label>

            {enableStake && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Stake Amount (SOL)
                  </label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    If You Fail, Stake Goes To
                  </label>
                  <select
                    value={stakeDestination}
                    onChange={(e) => setStakeDestination(e.target.value as StakeDestination)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-violet-500 transition-colors"
                  >
                    <option value={StakeDestination.ReturnToCreator}>Return to Me (No Risk)</option>
                    <option value={StakeDestination.CommunityPool}>Community Pool</option>
                    <option value={StakeDestination.TopVoters}>Top Voters (Rewards)</option>
                    <option value={StakeDestination.Charity}>Charity</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !title || !description || !openDate}
            className="w-full py-6 text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {step === "creating" && "Creating Capsule..."}
                {step === "staking" && "Adding Stake..."}
                {step === "complete" && "Success!"}
              </span>
            ) : (
              "Create Capsule"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

