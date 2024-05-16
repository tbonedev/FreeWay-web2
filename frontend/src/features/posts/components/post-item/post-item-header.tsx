'use client';

import { useRouter } from 'next/navigation';

import { Button, Icons } from '@/components';

export const PostItemHeader = () => {
  const router = useRouter();

  return (
    <div className="relative flex w-full items-center justify-center border-b py-3 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2"
        onClick={() => router.back()}
      >
        <Icons.arrowLeft className="size-7" />
      </Button>
      <h2 className="text-lg font-medium">Post</h2>
    </div>
  );
};
