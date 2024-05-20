'use client';

import {
  Button,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icons,
  useToast,
} from '@/components';
import { env } from '@/env.mjs';
import { PostFormModal, TPost } from '@/features/posts';

type TPostsListItemDropdownProps = {
  post: TPost;
};

export const PostItemDropdown = ({ post }: TPostsListItemDropdownProps) => {
  const { toast } = useToast();

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(`${env.NEXT_PUBLIC_APP_URL}post/${post.id}`);

    toast({
      title: 'Link copied to clipboard!',
    });
  };

  return (
    <PostFormModal post={post}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <Icons.ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {post.isEditable && (
            <>
              <DropdownMenuItem>
                <DialogTrigger className="flex items-center">
                  <Icons.edit className="mr-2 size-4" />
                  <span>Edit post</span>
                </DialogTrigger>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={copyLinkToClipboard}>
            <Icons.copy className="mr-2 size-4" />
            <span>Copy link</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PostFormModal>
  );
};
