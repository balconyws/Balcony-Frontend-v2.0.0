'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCheckIcon,
  UserIcon,
  FileTextIcon,
  AudioLinesIcon,
  ImageIcon,
  VideoIcon,
} from 'lucide-react';

import { Navigation } from '@/contexts';
import { Conversation } from '@/types';
import { chatSlice, useAppSelector } from '@/redux';
import { formatDate } from '@/helper';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';

type Props = {
  // eslint-disable-next-line no-unused-vars
  onClick: (chat: Conversation) => Promise<void>;
};

const ContactList: React.FC<Props> = ({ onClick }: Props) => {
  const { popFromStack, previousPage, direction, pageVariants } = Navigation.useNavigation();
  const { loading, conversations } = useAppSelector(chatSlice.selectChat);

  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full">
      <Button
        variant="outline"
        className="flex justify-center items-center gap-2 hover:[svg]:text-primary-foreground"
        onClick={popFromStack}>
        <ArrowLeftIcon className="w-4 h-4" />
        <span className="leading-6">back to {previousPage}</span>
      </Button>
      <div className="pt-[14px] w-full h-full">
        {loading ? (
          <div className="w-full h-[90%] flex justify-center items-center">
            <Spinner
              show={true}
              size="medium"
              className="!text-primary w-10 h-10"
              iconClassName="w-7 h-7 stroke-2"
            />
          </div>
        ) : (
          <ScrollArea className="max-h-[74vh]">
            {conversations && conversations.length > 0 ? (
              conversations.map((c: Conversation, i: number) => (
                <div
                  key={i}
                  className={`cursor-pointer flex justify-between items-start py-4 ${
                    i !== conversations.length - 1 ? 'border-b border-b-[#EFF0F1]' : ''
                  }`}
                  onClick={async () => await onClick(c)}>
                  {c.member.image ? (
                    <Image
                      src={`${c.member.image}`}
                      alt="1"
                      width={59}
                      height={59}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-[59px] h-[59px] border rounded-full flex justify-center items-center gap-2 border-primary">
                      <UserIcon className="h-[34px] w-[34px] text-primary" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center items-center">
                    <h6 className="text-[15px] font-bold tracking-[-0.3px] mb-[3.66px]">
                      {c.member.firstName}
                    </h6>
                    <p className="flex justify-center items-center flex-col text-[14px] font-medium tracking-[-0.2px] w-10">
                      {c.lastMessage &&
                        c.lastMessage.text &&
                        (c.lastMessage.text.length > 8
                          ? `${c.lastMessage.text.slice(0, 10)}...`
                          : c.lastMessage.text)}
                      {c.lastMessage &&
                        c.lastMessage.media &&
                        (c.lastMessage.media.type === 'image' ? (
                          <ImageIcon className="text-primary w-5 h-5" />
                        ) : c.lastMessage.media.type === 'video' ? (
                          <VideoIcon className="text-primary w-5 h-5" />
                        ) : c.lastMessage.media.type === 'audio' ? (
                          <AudioLinesIcon className="text-primary w-5 h-5" />
                        ) : (
                          <FileTextIcon className="text-primary w-5 h-5" />
                        ))}
                    </p>
                  </div>
                  <div className="flex flex-col justify-start items-end">
                    <p className="text-[12px] font-medium tracking-[-0.24px] mb-2 xl:mb-[10.32px]">
                      {c.lastMessage?.updatedAt && formatDate(new Date(c.lastMessage.updatedAt))}
                    </p>
                    {c.seen && (
                      <CheckCheckIcon
                        strokeWidth={0.8}
                        className="text-primary w-[17px] h-[17px]"
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="w-full mt-4">No chat yet!</p>
            )}
          </ScrollArea>
        )}
      </div>
    </motion.div>
  );
};

export default ContactList;
