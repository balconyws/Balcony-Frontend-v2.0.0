'use client';

import dynamic from 'next/dynamic';
import { useMediaQuery } from 'react-responsive';

import { Navigation } from '@/contexts';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const BottomSheet = dynamic(() => import('react-draggable-bottom-sheet'), { ssr: false });

type Props = {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  ariaDescribedBy: string;
  content: React.ReactNode;
  height?: string;
  width?: string;
};

const Sidebar: React.FC<Props> = ({
  open,
  onOpenChange,
  ariaDescribedBy,
  content,
  height,
  width,
}: Props) => {
  const { closeOnInteractOutside } = Navigation.useNavigation();

  const isTablet: boolean = useMediaQuery({ query: '(max-width: 768px)' });

  if (isTablet) {
    return (
      <BottomSheet
        isOpen={open}
        close={() => closeOnInteractOutside && onOpenChange(false)}
        onDrag={event => !closeOnInteractOutside && event.preventDefault()}
        disabled={!closeOnInteractOutside}
        classNames={{
          bottomSheet: 'bottom-0 !transition-all !duration-300 !ease-in-out',
          window: {
            wrap: 'flex flex-col rounded-t-[25px] border bg-background box-shadow-sheet',
          },
          dragIndicator: {
            indicator: 'mx-auto !mt-3 !mb-[30px] !h-[5px] !w-[200px] !rounded-lg !bg-[#F0F0F0]',
            wrap: '!p-0',
          },
          backdrop: '!opacity-70 !transition-all !duration-300 !ease-in-out',
        }}>
        <div className={cn('mx-auto w-full max-w-sm overflow-hidden', height)}>{content}</div>
      </BottomSheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn('overflow-hidden', width)}
        onInteractOutside={event => !closeOnInteractOutside && event.preventDefault()}>
        <SheetHeader>
          <SheetTitle className="sr-only">{ariaDescribedBy}</SheetTitle>
          <SheetDescription className="sr-only">{ariaDescribedBy}</SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
