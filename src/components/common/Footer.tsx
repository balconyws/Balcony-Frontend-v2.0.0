'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMediaQuery } from 'react-responsive';
import { ChevronRightIcon } from 'lucide-react';

import { useAuthRedirect } from '@/hooks';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const footerLinks: { name: string; url: string }[] = [
  { name: 'about us', url: '/about-us' },
  { name: 'terms of service', url: '/terms' },
  { name: 'privacy policy', url: '/policy' },
  { name: 'faq', url: '/faq' },
  { name: 'become a workspace host', url: '/host/add/workspace' },
  { name: 'become a property host', url: '/pricing' },
];

type Props = object;

const Footer: React.FC<Props> = () => {
  const redirect = useAuthRedirect();
  const isTablet: boolean = useMediaQuery({ query: '(min-width: 992px) and (max-width: 1100px)' });
  const isLaptop: boolean = useMediaQuery({ query: '(min-width: 1101px) and (max-width: 1500px)' });

  return (
    <div className={`relative ${isLaptop ? 'mt-20' : isTablet ? 'mt-60' : ''}`}>
      <footer className="static lg:absolute lg:bottom-0 w-full flex justify-center lg:justify-end items-center lg:items-end mt-10">
        <div className="w-[90%] lg:w-2/5 mb-8 lg:mb-40 flex justify-center items-end">
          <div className="w-full lg:w-1/2">
            <div className=" pb-1 rounded-lg border border-[#F1F5F9]">
              <div className="w-full p-8">
                <h1 className="text-2xl !leading-5 font-semibold">
                  read, discover, <br /> explore..
                </h1>
              </div>
              <div className="flex justify-center items-center w-full">
                <Separator className="w-[78%] h-[0.8px]" />
              </div>
              <div className="p-[5px]">
                {footerLinks.map((link: { name: string; url: string }, i: number) => (
                  <div key={i}>
                    {link.name === 'become a workspace host' ? (
                      <Button
                        variant="secondary"
                        onClick={() => redirect(link.url)}
                        className="w-full flex justify-between items-center !py-[6px] !px-[25px]">
                        <p className="text-sm font-medium">{link.name}</p>
                        <ChevronRightIcon className="text-primary h-4 w-4" />
                      </Button>
                    ) : (
                      <Link
                        href={link.url}
                        className="flex justify-between items-center py-[6px] px-[25px]">
                        <p className="text-sm font-medium">{link.name}</p>
                        <ChevronRightIcon className="text-primary h-4 w-4" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-16 lg:mt-6 flex flex-col gap-[17px]">
              <Link
                href="https://apps.apple.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer flex justify-center items-center rounded-lg hover:shadow-md py-1 px-4 max-w-fit border border-border">
                <Image
                  src="/assets/icons/app-store.png"
                  alt="app-store"
                  width={512}
                  height={512}
                  className="w-7 -ml-2 mr-2"
                />
                <div className="flex flex-col justify-center items-start">
                  <p className="text-[6px] text-black">DOWNLOAD ON THE</p>
                  <p className="text-base text-black font-semibold opacity-60">App Store</p>
                </div>
              </Link>
              <Link
                href="https://play.google.com/store/apps/details?id=com.homeworkbooking&hl=en&gl=US"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer flex justify-center items-center rounded-lg hover:shadow-md py-1 px-4 max-w-fit border border-border">
                <Image
                  src="/assets/icons/play-store.png"
                  alt="play-store"
                  width={496}
                  height={503}
                  className="w-8 -ml-2 mr-2"
                />
                <div className="flex flex-col justify-center items-start">
                  <p className="text-[6px] text-black">GET IT ON</p>
                  <p className="text-base text-black font-semibold opacity-60">Google Play</p>
                </div>
              </Link>
            </div>
            <div className="mt-8 flex justify-start items-center gap-4">
              <Link
                href="https://www.instagram.com/balconyworkspaces"
                target="_blank"
                rel="noopener noreferrer">
                <Image src="/assets/icons/instagram.svg" alt="instagram" width={20} height={20} />
              </Link>
              <Link href="https://twitter.com/balconyws" target="_blank" rel="noopener noreferrer">
                <Image src="/assets/icons/twitter.svg" alt="twitter" width={20} height={20} />
              </Link>
              <Link
                href="https://www.facebook.com/balconyws"
                target="_blank"
                rel="noopener noreferrer">
                <Image src="/assets/icons/facebook.svg" alt="facebook" width={20} height={20} />
              </Link>
            </div>
            <p className="text-black text-base !leading-normal mt-4">© balcony workspaces LLC</p>
          </div>
        </div>
        <div className="w-3/5 hidden lg:block"></div>
      </footer>
      <Image
        src="/assets/img/footer.svg"
        alt="bg-1"
        width={1200}
        height={1200}
        quality={100}
        priority
        className="w-full hidden lg:block"
      />
    </div>
  );
};

export default Footer;
