'use client';

import { motion } from 'framer-motion';
import { ArrowLeftIcon } from 'lucide-react';

import { Navigation } from '@/contexts';
import { Button } from '@/components/ui/button';
import { UpdateUserProfileForm } from '@/components/forms';

type Props = object;

const UpdateUserProfile: React.FC<Props> = () => {
  const { popFromStack, previousPage, direction, pageVariants } = Navigation.useNavigation();

  return (
    <motion.div
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full">
      <div className="h-full w-full px-5">
        <Button
          variant="outline"
          className="flex justify-center items-center gap-2 hover:[svg]:text-primary-foreground"
          onClick={popFromStack}>
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="leading-6">back to {previousPage}</span>
        </Button>
        <div className="xl:pt-10 h-full">
          <UpdateUserProfileForm />
        </div>
      </div>
    </motion.div>
  );
};

export default UpdateUserProfile;
