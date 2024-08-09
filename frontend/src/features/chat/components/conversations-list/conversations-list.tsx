'use client';

import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button, Icons } from '@/components';
import { TConversation, UserSelectionModal } from '@/features/chat';

type TConversationsListProps = {
  conversations: TConversation[];
};

export const ConversationsList = ({
  conversations,
}: TConversationsListProps) => {
  const router = useRouter();

  return (
    <div className="bg-background md:ml-20 xl:absolute xl:right-0 xl:top-0 xl:z-20 xl:ml-0 xl:min-h-full xl:border-l xl:px-8 xl:py-7">
      <div className="bg-background sticky top-0 flex w-full items-center justify-between border-b px-2 py-3 md:px-5 xl:static xl:mb-5 xl:border-none xl:p-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="md:hidden"
        >
          <Icons.arrowLeft className="size-7" />
        </Button>
        <h2 className="text-lg font-medium">Messages</h2>
        <UserSelectionModal />
      </div>
      <div className="space-y-5 p-5 xl:p-0">
        {conversations.map(({ id, username, messages, image, createdAt }) => (
          <Link
            href={`/chat/${id}`}
            key={id}
            className="flex items-center gap-3"
          >
            <Image
              src={image}
              alt="user avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p>{username}</p>
              <p className="text-muted-foreground flex items-center text-sm">
                {messages[0].slice(0, 20)}...
                <Icons.dot />
                {moment(createdAt).fromNow()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
