'use client';
import { use } from 'react';

export default function CapsuleDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  return (
    <div>
      <h1>Capsule {address}</h1>
      <p>Capsule details</p>
    </div>
  );
}
