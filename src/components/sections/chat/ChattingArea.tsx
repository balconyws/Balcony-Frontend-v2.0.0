'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import WaveSurfer from 'wavesurfer.js';
import { ArrowLeftIcon, DownloadIcon, UserIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Conversation, Message, SocketMessage } from '@/types';
import socket, { addUser } from '@/socket';
import { formatDate } from '@/helper';
import { authSlice, chatActions, chatSlice, useAppDispatch, useAppSelector } from '@/redux';
import { Spinner } from '@/components/ui/Spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { SendMessageForm } from '@/components/forms';
import { AudioPlayer } from '..';

type Props = {
  chat: Conversation;
  goBackToContactList: () => void;
};

const ChattingArea: React.FC<Props> = ({ chat, goBackToContactList }: Props) => {
  const { previousPage, direction, pageVariants } = Navigation.useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(authSlice.selectAuth);
  const { loading, messages: savedMessages } = useAppSelector(chatSlice.selectChat);
  const [messages, setMessages] = useState<Message[] | null>(savedMessages || null);
  const [arrivalMessage, setArrivalMessage] = useState<SocketMessage | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioPlayerRefs = useRef<{ [key: string]: WaveSurfer | null }>({});

  useEffect(() => {
    if (savedMessages) {
      setMessages(savedMessages);
    }
  }, [savedMessages]);

  useEffect(() => {
    const handleGetMessage = (data: SocketMessage) => {
      setArrivalMessage(data);
    };
    socket.on('getMessage', handleGetMessage);
    return () => {
      socket.off('getMessage', handleGetMessage);
    };
  }, []);

  useEffect(() => {
    if (isOnline && chat) {
      dispatch(chatActions.updateConversation({ conversationId: chat._id, isSeen: true }));
    }
  }, [isOnline, chat, dispatch]);

  useEffect(() => {
    const handleGetUsers = (data: { userId: string; socketId: string }[]) => {
      const online = data.find(user => user.userId === chat.member._id);
      setIsOnline(!!online);
    };
    socket.on('getUsers', handleGetUsers);
    return () => {
      socket.off('getUsers', handleGetUsers);
    };
  }, [chat]);

  useEffect(() => {
    if (arrivalMessage && chat.member._id === arrivalMessage.senderId) {
      setMessages(prev => {
        const newMessages = [
          ...(prev || []),
          {
            _id: arrivalMessage.senderId + arrivalMessage.receiverId,
            conversationId: chat._id,
            senderId: arrivalMessage.senderId,
            text: arrivalMessage.text,
            media: arrivalMessage.media,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        dispatch(chatSlice.setMessages({ messages: newMessages }));
        return newMessages;
      });
    }
  }, [arrivalMessage, chat, dispatch]);

  useEffect(() => {
    if (scrollRef.current && !loading) {
      setTimeout(() => {
        if (scrollRef.current?.childNodes) {
          const el = scrollRef.current.childNodes[1] as HTMLElement;
          setTimeout(() => (el.scrollTop = el.scrollHeight + 200), 100);
        }
      }, 100);
    }
  }, [loading, messages]);

  useEffect(() => {
    if (user) {
      addUser(user._id);
    }
  }, [chat, user]);

  const handlePlayAudio = (url: string) => {
    if (playingAudio && playingAudio !== url) {
      const previousPlayer = audioPlayerRefs.current[playingAudio];
      if (previousPlayer) {
        previousPlayer.pause();
      }
    }
    setPlayingAudio(prev => (prev === url ? null : url));
  };

  const openFile = (url?: string) => {
    const newTab = window.open(url, '_blank');
    if (newTab) {
      newTab.focus();
    }
  };

  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full">
      <div className="flex justify-between items-start pr-4">
        <Button
          variant="outline"
          className="flex justify-center items-center gap-2 hover:[svg]:text-primary-foreground"
          onClick={goBackToContactList}>
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="leading-6">back to {previousPage}</span>
        </Button>
        <div className="flex justify-center items-center gap-[13px]">
          {chat.member.image ? (
            <Image
              src={chat.member.image}
              alt="1"
              width={59}
              height={59}
              className="rounded-full w-[42px] h-[42px]"
            />
          ) : (
            <div className="w-[42px] h-[42px] border rounded-full flex justify-center items-center gap-2 border-primary">
              <UserIcon className="h-[30px] w-[30px] text-primary" />
            </div>
          )}
          <div className="flex flex-col justify-center items-start">
            <h6 className="text-[16px] font-bold tracking-[-0.32px]">{chat.member.firstName}</h6>
            <p className="text-[14px] font-normal tracking-[-0.28px]">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>
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
          <div className="w-full h-full flex flex-col justify-between items-center pb-12">
            {messages && (
              <ScrollArea
                ref={scrollRef}
                className={`mt-6 lg:mt-10 mb-4 lg:mb-8 pr-12 w-full -mr-12 ${
                  messages.length === 0 ? 'h-auto' : 'h-[60vh] lg:h-3/4'
                }`}>
                {messages.length > 0 ? (
                  messages.map((m: Message, i: number) => (
                    <div
                      key={i}
                      className={`w-full flex flex-col justify-start ${m.senderId !== user?._id ? 'items-start' : 'items-end'}`}>
                      <div
                        className={`my-[5px] py-[10px] w-fit max-w-[227px] ${
                          (m.text || m.media?.type === 'audio' || m.media?.type === 'document') &&
                          'px-5'
                        } ${
                          m.senderId !== user?._id
                            ? `text-left ${
                                (m.text ||
                                  m.media?.type === 'audio' ||
                                  m.media?.type === 'document') &&
                                'bg-[rgba(0,84,81,0.70)]'
                              }`
                            : `text-right ${
                                (m.text ||
                                  m.media?.type === 'audio' ||
                                  m.media?.type === 'document') &&
                                'border border-primary'
                              }`
                        } ${(m.media?.type === 'audio' || m.media?.type === 'document') && 'rounded-[100px]'}
                       ${m.text && (m.text.length > 20 ? 'rounded-[15px]' : 'rounded-[100px]')}`}>
                        {m.media ? (
                          m.media.type === 'image' ? (
                            <Image
                              src={m.media.url}
                              alt={m.media.type}
                              width={1080}
                              height={1080}
                              className="rounded-md w-full h-full"
                            />
                          ) : m.media.type === 'video' ? (
                            <video
                              src={m.media.url}
                              controls={true}
                              autoPlay={false}
                              className="rounded-md w-full h-full"
                            />
                          ) : m.media.type === 'audio' ? (
                            <AudioPlayer
                              source={m.media.url}
                              isPlaying={playingAudio === m.media.url}
                              color={m.senderId === user?._id ? 'primary' : 'secondary'}
                              onPlayPause={() => m.media?.url && handlePlayAudio(m.media.url)}
                              onEnded={() => {
                                if (playingAudio) {
                                  audioPlayerRefs.current[playingAudio];
                                }
                                setPlayingAudio(null);
                              }}
                            />
                          ) : (
                            <div
                              onClick={() => openFile(m.media?.url)}
                              className={`flex justify-start items-center gap-[9px] cursor-pointer ${
                                m.senderId === user?._id ? 'text-primary' : 'text-white'
                              }`}>
                              <p className="text-[12px] text-inherit leading-5 font-semibold">
                                Document File
                              </p>
                              <DownloadIcon className="text-inherit w-4 h-4" />
                            </div>
                          )
                        ) : (
                          m.text && (
                            <p
                              className={`text-[15px] tracking-[-0.3px] ${
                                m.senderId !== user?._id ? 'text-primary-foreground' : 'text-black'
                              }`}>
                              {m.text}
                            </p>
                          )
                        )}
                      </div>
                      <p
                        className={`text-[12px] text-black tracking-[-0.24px] ${m.text ? 'my-1' : 'mb-1'}`}>
                        {formatDate(new Date(m.createdAt))}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="w-full">No message yet!</p>
                )}
              </ScrollArea>
            )}
            <SendMessageForm
              conversationId={chat._id}
              receiverId={chat.member._id}
              setMessages={setMessages}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChattingArea;
