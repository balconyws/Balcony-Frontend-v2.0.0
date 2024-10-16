import { NextPage } from 'next';

import { Footer } from '@/components/common';

type Props = object;

const AboutUs: NextPage<Props> = () => (
  <>
    <main className="pt-36 xl:pt-40 flex flex-col justify-center items-center mb-16">
      <div className="w-[90%] lg:w-4/5">
        <h1 className="text-[40px] lg:text-[50px] leading-[70%] lg:leading-normal">About Us</h1>
        <p className="mt-8 text-[20px]">
          Welcome to the Balcony experience, your one-stop destination for finding the perfect
          workspace solutions tailored to your needs. We understand that the way we work is evolving
          rapidly, and flexibility is key. That&apos;s why we&apos;ve created a platform that
          connects you with a diverse range of workspace providers, making it easy for you to
          discover and book the ideal workspace, whether you&apos;re a freelancer, startup, remote
          worker, or established business.
        </p>
        <p className="mt-5 text-[20px]">
          We also offer a complete property leasing management as a service to make any leasing
          experience seamless.
        </p>
        <h2 className="mt-5 text-[30px]">Our Plans</h2>
        <p className="mt-7 text-[20px]">
          We feel that workspaces should adapt to your needs, not the other way around. Our platform
          is designed to help you find workspaces where you may be able to increase productivity,
          collaboration, and innovation, all while offering the flexibility you deserve.
        </p>
        <h2 className="mt-5 text-[30px]">What We Offer</h2>
        <ul className="mt-7 ml-7 list-disc">
          <li className="text-[20px]">
            Diverse Workspace Options: We partner with a wide array of workspace providers, from
            cutting-edge co-working spaces to serene private offices, ensuring that you&apos;ll
            always find a workspace that suits your preferences and requirements.
          </li>
          <li className="mt-5 text-[20px]">
            Seamless Booking: Our user-friendly platform simplifies the booking process. Browse
            available spaces, compare amenities, and secure your spot with just a few clicks.
          </li>
          <li className="mt-5 text-[20px]">
            Reliability and Quality: We are committed to maintaining high standards across all the
            workspaces listed on our platform. We partner with reputable providers to ensure a
            consistently exceptional experience for our users.
          </li>
          <li className="mt-5 text-[20px]">
            Customer Support: Have questions or need assistance? Our dedicated customer support team
            is here to help. We&apos;re just a message away, ready to assist you every step of the
            way.
          </li>
        </ul>
      </div>
    </main>
    <Footer />
  </>
);

export default AboutUs;
