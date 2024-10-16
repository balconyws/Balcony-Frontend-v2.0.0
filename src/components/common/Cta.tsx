'use client';

import { Cta as CtaContext } from '@/contexts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

type Props = object;

const Cta: React.FC<Props> = () => {
  const {
    open,
    setOpen,
    title,
    description,
    submitBtnText,
    submitBtnAction,
    disableSubmitBtn,
    closeBtnText,
    closeBtnAction,
    disableCloseBtn,
    loading,
  } = CtaContext.useCta();

  return (
    <Dialog open={open} onOpenChange={loading ? () => {} : setOpen}>
      <DialogContent className="w-[342px] md:w-[425px] rounded-md border border-[#CBD5E1]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold leading-7">{title}</DialogTitle>
          <DialogDescription className="text-[#64748B] text-[14px] leading-5">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          {submitBtnText && submitBtnAction && (
            <Button
              variant="outline"
              className={`leading-6 border-[#E2E8F0] ${loading && 'min-w-20 hover:bg-inherit'}`}
              onClick={submitBtnAction}
              isLoading={loading}
              strokeColor="#005451"
              disabled={disableSubmitBtn || loading}>
              {submitBtnText}
            </Button>
          )}
          <DialogClose asChild disabled={disableCloseBtn || loading}>
            <Button
              className="leading-6"
              onClick={closeBtnAction}
              disabled={disableCloseBtn || loading}>
              {closeBtnText || 'done'}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Cta;
