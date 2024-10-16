'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { Navigation } from '@/contexts';
import { Amenity } from '@/types';
import { amenities } from '@/helper';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

type Props = object;

const MapSearchFilter: React.FC<Props> = () => {
  const { direction, pageVariants } = Navigation.useNavigation();
  const [filledStars, setFilledStars] = useState<number>(0);

  const handleStarClick = (index: number) => {
    if (index + 1 === filledStars) {
      setFilledStars(0);
    } else {
      setFilledStars(index + 1);
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
      <div className="w-full mt-8 px-4 lg:px-0">
        <ScrollArea className="h-[64vh] md:h-[94vh] lg:h-[84vh] xl:h-[94vh] -mr-8">
          <div className="flex flex-col items-end w-full h-full pr-8">
            <h1 className="text-[22px] text-black">place</h1>
            <div className="mt-[19px] flex justify-end items-center gap-[39px]">
              <div className="flex justify-center items-center gap-[6px]">
                <Checkbox
                  id="property"
                  className="border-black ring-offset-background focus-visible:ring-black data-[state=checked]:bg-black"
                />
                <Label htmlFor="property" className="text-[13px] text-black">
                  property
                </Label>
              </div>
              <div className="flex justify-center items-center gap-[6px]">
                <Checkbox
                  id="workspace"
                  className="border-black ring-offset-background focus-visible:ring-black data-[state=checked]:bg-black"
                />
                <Label htmlFor="workspace" className="text-[13px] text-black">
                  workspace
                </Label>
              </div>
            </div>
            <h1 className="mt-10 text-[22px] text-black">price range</h1>
            <div className="mt-[19px] flex justify-end items-center gap-[23px]">
              <div className="w-[73px] h-[29px] border-2 border-black focus-visible:ring-black rounded-3xl flex justify-center items-center relative">
                <Input
                  type="number"
                  min={0}
                  className="w-full h-full bg-transparent border-none ring-0 focus-visible:ring-transparent"
                />
                <p className="text-[14px] text-black bg-white absolute -top-3 px-[2px]">min</p>
              </div>
              <Separator className="bg-black w-[6px] h-[2px] my-auto" />
              <div className="w-[73px] h-[29px] border-2 border-black focus-visible:ring-black rounded-3xl flex justify-center items-center relative">
                <Input
                  type="number"
                  min={0}
                  className="w-full h-full bg-transparent border-none ring-0 focus-visible:ring-transparent"
                />
                <p className="text-[14px] text-black bg-white absolute -top-3 px-[2px]">max</p>
              </div>
            </div>
            <h1 className="mt-[38px] text-[22px] text-black">ratings</h1>
            <div className="mt-[20px] flex justify-end items-center gap-1">
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <Image
                    key={i}
                    src={
                      i < filledStars
                        ? '/assets/icons/star-filled.svg'
                        : '/assets/icons/star-outline.svg'
                    }
                    alt={`star-${i}`}
                    width={24}
                    height={24}
                    className="w-6 h-6 cursor-pointer"
                    onClick={() => handleStarClick(i)}
                  />
                ))}
            </div>
            <h1 className="mt-[38px] text-[22px] text-black">amenities</h1>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {amenities.map((amenity: Amenity, i: number) => (
                <div key={i} className="flex items-center gap-[6px]">
                  <Checkbox
                    id={amenity.label}
                    className="border-black ring-offset-background focus-visible:ring-black data-[state=checked]:bg-black"
                  />
                  <Label htmlFor={amenity.label} className="text-[13px] text-black">
                    {amenity.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
};

export default MapSearchFilter;
