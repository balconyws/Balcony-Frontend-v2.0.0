'use client';

import { useEffect, useState } from 'react';

import { Navigation } from '@/contexts';
import { Conversation } from '@/types';
import { chatSlice, chatActions, useAppDispatch, useAppSelector } from '@/redux';
import { ChattingArea, ContactList } from '..';

type Props = {
  setDimensions: React.Dispatch<
    React.SetStateAction<{
      width: string;
      height: string;
    }>
  >;
};

const Chat: React.FC<Props> = ({ setDimensions }: Props) => {
  const { currentPage, pushToStack, popFromStack, dataPassed } = Navigation.useNavigation();
  const { conversations, messages } = useAppSelector(chatSlice.selectChat);
  const dispatch = useAppDispatch();
  const [chat, setChat] = useState<Conversation | null>(null);

  useEffect(() => {
    if (currentPage === 'chats') {
      if (dataPassed && dataPassed.chat) {
        setChat(dataPassed.chat);
        dispatch(chatActions.getMessages({ conversationId: dataPassed.chat._id }));
        pushToStack('chatroom', undefined);
        return;
      }
      dispatch(chatActions.getConversations());
    }
  }, [currentPage, dataPassed, dispatch, pushToStack]);

  useEffect(() => {
    setDimensions({
      width: 'w-[51%] lg:w-[31%] xl:w-[26%]',
      height:
        (conversations && conversations.length > 5) || (messages && messages.length > 6)
          ? 'h-[80vh]'
          : 'h-[80vh] lg:h-auto',
    });
  }, [chat, conversations, messages, setDimensions]);

  const setChatRoom = async (chat: Conversation) => {
    setChat(chat);
    pushToStack('chatroom', null);
    await dispatch(chatActions.getMessages({ conversationId: chat._id }));
  };

  const goBackToContactList = () => {
    setChat(null);
    popFromStack();
  };

  return (
    <div className="w-full h-full">
      {currentPage === 'chatroom' && chat ? (
        <ChattingArea chat={chat} goBackToContactList={goBackToContactList} />
      ) : (
        currentPage === 'chats' && conversations && <ContactList onClick={setChatRoom} />
      )}
    </div>
  );
};

export default Chat;
