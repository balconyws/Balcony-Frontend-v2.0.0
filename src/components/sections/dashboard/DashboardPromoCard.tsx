'use client';

import Image from 'next/image';
import { useState, ChangeEvent, useEffect } from 'react';

import { Promo, PromoType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/Spinner';
import {
  promoActions,
  useAppDispatch,
  authSlice,
  promoSlice,
  useAppSelector,
  waitForDispatch,
} from '@/redux';

type Props = object;

const DashboardPromoCard: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(authSlice.selectAuth);
  const { promos: storedPromos } = useAppSelector(promoSlice.selectPromo);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [promoErrors, setPromoErrors] = useState<{ code: boolean; discount: boolean }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        waitForDispatch(dispatch, promoActions.getAllPromos(), state => {
          const { loading } = state.promo;
          setLoading(loading);
        });
      }
      if (user.role === 'host') {
        waitForDispatch(
          dispatch,
          promoActions.getHostPromos({
            hostId: user._id,
          }),
          state => {
            const { loading } = state.promo;
            setLoading(loading);
          }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (storedPromos) {
      setPromos([...storedPromos]);
      setPromoErrors(Array(storedPromos.length).fill({ code: false, discount: false }));
    }
  }, [storedPromos]);

  const addNewPromo = () => {
    setPromos(prev => [
      ...prev,
      { _id: new Date().toISOString(), code: '', type: 'percentage', discount: 1 },
    ]);
    setPromoErrors(prev => [...prev, { code: false, discount: false }]);
  };

  const deletePromo = (index: number) => {
    setPromos(promos.filter((_, i: number) => i !== index));
    setPromoErrors(promoErrors.filter((_, i: number) => i !== index));
  };

  const validatePromo = (index: number) => {
    const promo = promos[index];
    const errors = { code: false, discount: false };
    if (!promo.code.trim()) {
      errors.code = true;
    }
    if (promo.type === 'flat') {
      if (isNaN(promo.discount) || promo.discount <= 0) {
        errors.discount = true;
      }
    } else if (promo.type === 'percentage') {
      if (isNaN(promo.discount) || promo.discount <= 0 || promo.discount > 100) {
        errors.discount = true;
      }
    }
    const updatedErrors = [...promoErrors];
    updatedErrors[index] = errors;
    setPromoErrors(updatedErrors);
    return !errors.code && !errors.discount;
  };

  const handleCodeChange = (index: number, value: string) => {
    setPromos(prevPromos =>
      prevPromos.map((promo, i) => {
        if (i === index) {
          return {
            ...promo,
            code: value,
          };
        }
        return promo;
      })
    );
    validatePromo(index);
  };

  const handleDiscountChange = (index: number, value: string) => {
    setPromos(prevPromos =>
      prevPromos.map((promo, i) => {
        if (i === index) {
          let discountValue = promo.discount;
          if (promo.type === 'flat') {
            const rawValue = value.replace(/[^0-9.]/g, '');
            discountValue = rawValue ? parseFloat(rawValue) : 0;
          } else if (promo.type === 'percentage') {
            const rawValue = value.replace(/[^\d]/g, '');
            discountValue = Math.min(Number(rawValue), 100);
          }
          return {
            ...promo,
            discount: discountValue,
          };
        }
        return promo;
      })
    );
    validatePromo(index);
  };

  const handleTypeChange = (index: number, value: PromoType) => {
    setPromos(prevPromos =>
      prevPromos.map((promo, i) => {
        if (i === index) {
          return {
            ...promo,
            type: value,
          };
        }
        return promo;
      })
    );
  };

  return (
    <Card className="w-full md:w-[400px] h-fit border border-border rounded-md box-shadow-primary">
      <CardContent className="p-6">
        <h1 className="text-[23px] font-semibold leading-6 tracking-[-1px]">promotion</h1>
        <p className="mt-3 text-[rgba(0,84,81,0.70)] text-[12px] leading-5">
          add promotions so people can use in checkout
        </p>
        {loading ? (
          <Spinner
            show={true}
            className="w-full h-[10vh] lg:h-[14vh]"
            iconClassName="w-6 lg:w-8 h-6 lg:h-8"
          />
        ) : (
          <ScrollArea className="h-[284px]">
            <div className="mt-6 w-[335px] ml-[2px]">
              {promos &&
                (promos.length === 0 ? (
                  <p className="w-full my-4 text-sm">No promo yet!</p>
                ) : (
                  promos.map((p: Promo, i: number) => (
                    <div key={i}>
                      <div
                        className={`flex justify-between items-center gap-3 ${i !== 0 && 'mt-6'}`}>
                        <div className="w-[45%] flex flex-col gap-3">
                          <Label className="text-[13px] font-medium leading-[14px]">
                            promo {i + 1}
                          </Label>
                          <Input
                            placeholder="promo code"
                            value={p.code}
                            error={promoErrors[i]?.code}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleCodeChange(i, e.target.value)
                            }
                          />
                        </div>
                        <div className="w-[45%] flex flex-col gap-[6px]">
                          <Label className="flex justify-start items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className={`text-[11px] font-medium leading-5 text-inherit p-0 rounded-none ${
                                p.type === 'percentage' && 'border-b border-b-primary'
                              }`}
                              onClick={() => handleTypeChange(i, 'percentage')}>
                              percentage
                            </Button>{' '}
                            /{' '}
                            <Button
                              variant="secondary"
                              size="sm"
                              className={`text-[11px] font-medium leading-5 text-inherit p-0 rounded-none ${
                                p.type === 'flat' && 'border-b border-b-primary'
                              }`}
                              onClick={() => handleTypeChange(i, 'flat')}>
                              flat
                            </Button>
                          </Label>
                          <Input
                            type="text"
                            placeholder={
                              p.type === 'flat' ? 'discount price' : 'discount percentage'
                            }
                            value={p.type === 'flat' ? `$${p.discount}` : `${p.discount}%`}
                            error={promoErrors[i]?.discount}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleDiscountChange(i, e.target.value)
                            }
                            onFocus={e => e.target.select()}
                          />
                        </div>
                        <div className="w-1/12 h-full flex flex-col gap-2">
                          <Button
                            variant="underline"
                            className="text-[10px] font-normal"
                            onClick={async () => {
                              if (!validatePromo(i)) return;
                              if (!isNaN(Date.parse(p._id))) {
                                await dispatch(promoActions.createPromo(p));
                              } else {
                                await dispatch(promoActions.updatePromo(p));
                              }
                            }}>
                            {!isNaN(Date.parse(p._id)) ? 'add' : 'update'}
                          </Button>
                          <Button
                            variant="underline"
                            className="text-[10px] font-normal"
                            onClick={async () => {
                              deletePromo(i);
                              if (isNaN(Date.parse(p._id))) {
                                await dispatch(promoActions.deletePromo({ promoId: p._id }));
                              }
                            }}>
                            delete
                          </Button>
                        </div>
                      </div>
                      {i < promos.length - 1 && <Separator className="my-[10px] h-[0.8px]" />}
                    </div>
                  ))
                ))}
            </div>
          </ScrollArea>
        )}
        <Button
          type="button"
          variant="secondary"
          className="mt-3 !p-0 flex gap-[10px] justify-start items-center"
          onClick={addNewPromo}>
          <Image
            src="/assets/icons/add.svg"
            alt="add"
            width={30}
            height={30}
            className="w-[30px] h-[30p]"
          />
          <p className="text-[13px] font-medium leading-[14px]">add new promo</p>
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardPromoCard;
