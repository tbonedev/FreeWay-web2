'use client';

import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button, Icons } from '@/components';

const data = [
  {
    id: 1,
    username: 'Sraken',
    image: '/user.jpg',
    lastMessage: 'Cześć, dzisiaj nie moge wyjść na miasto',
    createdAt: new Date().setDate(20),
  },
  {
    id: 2,
    username: 'Kubx1999',
    image: '/user.jpg',
    lastMessage: 'Lorem ispum',
    createdAt: new Date().setDate(15),
  },
  {
    id: 3,
    username: 'skolaczk',
    image: '/user.jpg',
    lastMessage: 'elo debylu wehcodx',
    createdAt: new Date().setDate(10),
  },
  {
    id: 4,
    username: 'Sraken',
    image: '/user.jpg',
    lastMessage: 'Cześć, dzisiaj nie moge wyjść na miasto',
    createdAt: new Date().setDate(22),
  },
  {
    id: 5,
    username: 'Sraken',
    image: '/user.jpg',
    lastMessage: 'Cześć, dzisiaj nie moge wyjść na miasto',
    createdAt: new Date().setDate(20),
  },
  {
    id: 6,
    username: 'Kubx1999',
    image: '/user.jpg',
    lastMessage: 'Lorem ispum',
    createdAt: new Date().setDate(15),
  },
  {
    id: 7,
    username: 'skolaczk',
    image: '/user.jpg',
    lastMessage: 'elo debylu wehcodx',
    createdAt: new Date().setDate(10),
  },
  {
    id: 8,
    username: 'Sraken',
    image: '/user.jpg',
    lastMessage: 'Cześć, dzisiaj nie moge wyjść na miasto',
    createdAt: new Date().setDate(22),
  },
  {
    id: 9,
    username: 'SocialHub',
    image: '/user.jpg',
    lastMessage: 'Witaj',
    createdAt: new Date().setDate(2),
  },
];

const ChatPage = () => {
  const router = useRouter();

  return (
    <>
      <div className="hidden h-screen flex-col items-center justify-center xl:flex">
        <Icons.messageCircle className="mb-3" />
        <h3 className="text-lg font-medium">Your messages</h3>
        <p className="text-muted-foreground text-sm">
          Send private photos and messages to friends.
        </p>
        <Button className="mt-4">Send message</Button>
      </div>
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
          <Button variant="ghost" size="icon">
            <Icons.edit className="size-6" />
          </Button>
        </div>
        <div className="space-y-5 p-5 xl:p-0">
          {data.map(({ id, username, lastMessage, image, createdAt }) => (
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
                  {lastMessage.slice(0, 20)}...
                  <Icons.dot />
                  {moment(createdAt).fromNow()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
