'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CircleCheckBigIcon,
  CircleSlash2Icon,
  CreditCardIcon,
  PlusIcon,
} from 'lucide-react';

import { Navigation, Cta } from '@/contexts';
import { CardDetail } from '@/types';
import { cardActions, cardSlice, useAppDispatch, useAppSelector } from '@/redux';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/Spinner';
import { AddCreditCardForm } from '@/components/forms';

type Tabs = 'cards' | 'paypal' | 'add';

const SlidingTabContent = ({
  children,
  direction,
  animate,
}: {
  children: React.ReactNode;
  direction: 'left' | 'right';
  animate: boolean;
}) => (
  <motion.div
    initial={animate ? { opacity: 0, x: direction === 'left' ? 50 : -50 } : {}}
    animate={animate ? { opacity: 1, x: 0 } : {}}
    exit={animate ? { opacity: 0, x: direction === 'left' ? -50 : 50 } : {}}
    transition={{ duration: 0.3 }}>
    {children}
  </motion.div>
);

type Props = object;

const Wallet: React.FC<Props> = () => {
  const { setOpen, pushToStack, popFromStack, previousPage, direction, pageVariants, dataPassed } =
    Navigation.useNavigation();
  const {
    setOpen: CtaOpenHandler,
    setTitle,
    setDescription,
    setSubmitBtnText,
    setSubmitBtnAction,
    setCloseBtnText,
    setCloseBtnAction,
    setLoading,
  } = Cta.useCta();
  const dispatch = useAppDispatch();
  const { loading, cards } = useAppSelector(cardSlice.selectCard);
  const [activeTab, setActiveTab] = useState<Tabs>('cards');
  const [editCard, setEditCard] = useState<CardDetail | undefined>(undefined);

  const prevTab = useRef<'left' | 'right' | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  useEffect(() => {
    if (typeof dataPassed === 'string' && dataPassed === 'add') {
      setActiveTab('add');
    }
  }, [dataPassed]);

  useEffect(() => {
    dispatch(cardActions.getAllCards());
  }, [dispatch]);

  const getDirection = () => (prevTab.current === 'right' ? 'left' : 'right');

  const handleTabChange = (value: string) => {
    prevTab.current = getDirection();
    setActiveTab(value as Tabs);
    if (editCard) {
      setEditCard(undefined);
    }
  };

  const handleEdit = (card: CardDetail) => {
    handleTabChange('add');
    setEditCard(card);
  };

  const handleDelete = async (card: CardDetail) => {
    setOpen(false);
    CtaOpenHandler(true);
    setTitle('permanently delete this card?');
    setDescription('');
    setSubmitBtnText('delete');
    setSubmitBtnAction(() => () => {
      setLoading(true);
      dispatch(cardActions.deleteCard({ id: card._id })).then(() => {
        CtaOpenHandler(false);
        pushToStack('wallet');
      });
    });
    setCloseBtnText('cancel');
    setCloseBtnAction(() => () => pushToStack('wallet'));
  };

  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full">
      <div className="px-3 xl:px-0 w-full h-full">
        <Button
          variant="outline"
          className="flex justify-center items-center gap-2 hover:[svg]:text-primary-foreground"
          onClick={popFromStack}>
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="leading-6">back to {previousPage}</span>
        </Button>
        <Tabs
          defaultValue="card"
          value={activeTab}
          onValueChange={handleTabChange}
          className="mt-6 xl:mt-8 h-fit overflow-x-hidden w-[353px] px-6 pt-6 pb-8 rounded-lg border border-[#E4E4E7] box-shadow-account">
          <h1 className="text-[23px] font-semibold leading-6 tracking-[-1px]">wallet</h1>
          <p className="text-[13px] leading-5">add a new payment method to your wallet.</p>
          <TabsList className="my-6 flex gap-4 shadow-none">
            <TabsTrigger
              value="cards"
              className="!bg-white flex flex-col justify-center items-center gap-3 h-[86px] w-[91px] rounded-sm border-2 border-zinc-100 data-[state=active]:border-primary">
              <CreditCardIcon className="text-primary w-6 h-6" />
              <p className="text-[13px] font-medium leading-[14px]">Card</p>
            </TabsTrigger>
            <TabsTrigger
              value="paypal"
              className="!bg-white flex flex-col justify-center items-center gap-3 h-[86px] w-[91px] rounded-sm border-2 border-zinc-100 data-[state=active]:border-primary">
              <Image
                src="/assets/icons/paypal.svg"
                alt="paypal"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <p className="text-[13px] font-medium leading-[14px]">paypal</p>
            </TabsTrigger>
            <TabsTrigger
              value="add"
              className="!bg-white flex flex-col justify-center items-center gap-3 h-[86px] w-[91px] rounded-sm border-2 border-zinc-100 data-[state=active]:border-primary">
              <div className="w-6 h-6 rounded-full border-[1.6px] border-primary flex justify-center items-center">
                <PlusIcon className="text-primary w-[14px] h-[14px]" />
              </div>
              <p className="text-[13px] font-medium leading-[14px]">add card</p>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="cards">
            <SlidingTabContent direction={getDirection()} animate={!isFirstRender.current}>
              {loading ? (
                <div className="w-full h-full flex justify-center items-center">
                  <Spinner
                    show={true}
                    size="medium"
                    className="!text-primary w-10 h-10"
                    iconClassName="w-7 h-7 stroke-2"
                  />
                </div>
              ) : (
                <ScrollArea className="h-[38vh] lg:h-[45vh] pb-2 xl:pb-0 xl:h-full">
                  {cards && cards.length > 0 ? (
                    cards.map((c: CardDetail, i: number) => (
                      <div key={i} className="mt-4 flex items-start gap-4">
                        {c.default ? (
                          <CircleCheckBigIcon className="text-primary w-4 h-4" />
                        ) : (
                          <CircleSlash2Icon
                            className="text-primary w-4 h-4 cursor-pointer"
                            onClick={async () =>
                              await dispatch(cardActions.changeDefaultCard({ cardId: c._id }))
                            }
                          />
                        )}
                        <div className="flex flex-col gap-2">
                          <p className="text-[#09090B] text-[13px] font-medium leading-[14px]">
                            name: {c.name}
                          </p>
                          <div className="flex justify-start items-center gap-4">
                            <p className="py-[10px] px-3 border border-border rounded-sm text-[12px] leading-5">
                              **** **** **** {c.cardNo}
                            </p>
                            <div className="flex gap-[9.65px]">
                              <Button variant="underline" onClick={() => handleEdit(c)}>
                                edit
                              </Button>
                              <Separator orientation="vertical" className="h-auto" />
                              <Button variant="underline" onClick={() => handleDelete(c)}>
                                delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="w-full mt-4 text-sm">No card yet!</p>
                  )}
                </ScrollArea>
              )}
            </SlidingTabContent>
          </TabsContent>
          <TabsContent value="paypal">
            <SlidingTabContent direction={getDirection()} animate={!isFirstRender.current}>
              {''}
            </SlidingTabContent>
          </TabsContent>
          <TabsContent value="add">
            <SlidingTabContent direction={getDirection()} animate={!isFirstRender.current}>
              <AddCreditCardForm card={editCard} changeTab={handleTabChange} />
            </SlidingTabContent>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default Wallet;
