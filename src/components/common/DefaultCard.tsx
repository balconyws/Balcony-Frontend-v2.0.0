'use client';

import Image from 'next/image';
import { useEffect } from 'react';

import { Navigation } from '@/contexts';
import { CardDetail } from '@/types';
import { cardActions, useAppDispatch, cardSlice, useAppSelector } from '@/redux';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';

type Props = {
  forceToWallet: boolean;
  feeMsg?: string;
  onClickUpdate?: () => void;
};

const DefaultCard = ({ forceToWallet, feeMsg, onClickUpdate }: Props) => {
  const dispatch = useAppDispatch();
  const { loading, cards } = useAppSelector(cardSlice.selectCard);
  const { pushToStack } = Navigation.useNavigation();

  useEffect(() => {
    dispatch(cardActions.getAllCards());
  }, [dispatch]);

  useEffect(() => {
    if (forceToWallet && cards && cards.length === 0) {
      pushToStack('wallet');
    }
  }, [cards, forceToWallet, pushToStack]);

  if (loading) {
    <Spinner show={true} size="medium" />;
  }

  return (
    <>
      {cards && cards.length > 0 ? (
        cards
          .filter(c => c.default)
          .map((c: CardDetail, i: number) => (
            <div key={i} className="flex justify-between items-start">
              <div className="w-fit flex gap-1">
                <Image src="/assets/icons/master-card.svg" alt={c.brand} width={16} height={16} />
                <div className="flex flex-col">
                  <p className="text-[#71717A] text-[13px] leading-5">{c.brand}</p>
                  {feeMsg && <p className="text-[#71717A] text-[6px] leading-[6px]">{feeMsg}</p>}
                </div>
              </div>
              <div className="flex flex-col justify-end items-end">
                <p className="text-[13px] leading-5">**** **** **** {c.cardNo}</p>
                <Button
                  variant="underline"
                  className="text-[10px] font-normal border-none underline w-fit text-center"
                  onClick={() => {
                    pushToStack('wallet');
                    if (onClickUpdate) {
                      onClickUpdate();
                    }
                  }}>
                  update
                </Button>
              </div>
            </div>
          ))
      ) : (
        <div className="flex justify-between items-start">
          <p className="w-full text-[12px]">No card yet!</p>
          <Button
            variant="underline"
            className="text-[12px] font-normal border-none underline w-fit text-center"
            onClick={() => pushToStack('wallet')}>
            add
          </Button>
        </div>
      )}
    </>
  );
};

export default DefaultCard;
