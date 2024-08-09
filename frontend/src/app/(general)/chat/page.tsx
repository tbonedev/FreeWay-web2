import { Icons } from '@/components';
import { ConversationsList } from '@/features/chat';

const conversations = [
  {
    id: 1,
    username: 'michal2000',
    image: '/user.jpg',
    messages: ['Lorem ipsum dolor sit amet, consectetur'],
    createdAt: new Date().setDate(20),
  },
  {
    id: 2,
    username: 'Kubx1999',
    image: '/user.jpg',
    messages: ['Lorem ispum'],
    createdAt: new Date().setDate(15),
  },
  {
    id: 3,
    username: 'skolaczk',
    image: '/user.jpg',
    messages: ['lorem ipsum folor sit amet, consectetur'],
    createdAt: new Date().setDate(10),
  },
  {
    id: 4,
    username: 'kamil990',
    image: '/user.jpg',
    messages: ['Cześć, dzisiaj nie moge wyjść na miasto'],
    createdAt: new Date().setDate(22),
  },
];

const ChatPage = () => {
  return (
    <>
      <div className="hidden h-screen flex-col items-center justify-center xl:flex">
        <Icons.messageCircle className="mb-3" />
        <h3 className="text-lg font-medium">Your messages</h3>
        <p className="text-muted-foreground text-sm">
          Send private photos and messages to friends.
        </p>
      </div>
      <ConversationsList conversations={conversations} />
    </>
  );
};

export default ChatPage;
