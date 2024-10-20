import { NextPage } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';

import { Footer } from '@/components/common';

type Props = object;

const Policy: NextPage<Props> = () => (
  <>
    <main className="pt-36 xl:pt-40 flex flex-col justify-center items-center mb-16">
      <div className="w-[90%] lg:w-4/5">
        <h1 className="text-[40px] lg:text-[50px] leading-[70%] lg:leading-normal">
          Privacy Policy
        </h1>
        <p className="mt-12 text-[20px]">
          Your privacy is important to us. It is Balcony&apos;s policy to respect your privacy and
          comply with any applicable requirements regarding any personal information we may collect
          about you, including across our website,{' '}
          <Link href="https://www.balcony.co/" className="underline">
            https://www.balcony.co/
          </Link>{' '}
          , and other sites we own and operate.
        </p>
        <p className="mt-5 text-[20px]">
          This policy is effective as of 21 February 2021 and was last updated on{' '}
          {format(new Date(), 'dd MMMM yyyy')}.
        </p>
        <h2 className="mt-5 text-[30px]">Information We Collect</h2>
        <p className="mt-7 text-[20px]">
          We feel that workspaces should adapt to your needs, not the other way around. Our platform
          is designed to help you find workspaces where you may be able to increase productivity,
          collaboration, and innovation, all while offering the flexibility you deserve.
        </p>
        <h2 className="mt-5 text-[30px]">What We Offer</h2>
        <p className="mt-7">
          Information we collect includes both information you knowingly and actively provide us
          when using or participating in any of our services and promotions, and any information
          automatically sent by your devices in the course of accessing our products and services.
        </p>
        <h2 className="mt-5 text-[30px]">Log Data</h2>
        <p className="mt-7">
          When you visit our website, our servers may automatically log the standard data provided
          by your web browser. It may include your device’s Internet Protocol (IP) address, your
          browser type and version, the pages you visit, the time and date of your visit, the time
          spent on each page, other details about your visit, and technical details that occur in
          conjunction with any errors you may encounter.
        </p>
        <p className="mt-5 text-[20px]">
          Please be aware that while this information may not be personally identifying by itself,
          it may be possible to combine it with other data to personally identify individual
          persons.
        </p>
        <h2 className="mt-5 text-[30px]">Personal Information</h2>
        <p className="mt-7 text-[20px]">
          We may ask for personal information which may include one or more of the following:
        </p>
        <ul className="mt-5 ml-7 list-disc">
          <li className="text-[20px]">Name</li>
          <li className="text-[20px]">Email</li>
          <li className="text-[20px]">Social Media Profiles</li>
          <li className="text-[20px]">Date of Birth</li>
          <li className="text-[20px]">Phone/Mobile Number</li>
          <li className="text-[20px]">Home/Mailing Address</li>
        </ul>
        <p className="mt-5 text-[20px]">
          Approved Reasons for Processing Your Personal Information <br /> We only collect and use
          your personal information when we have a legitimate reason for doing so. In which
          instance, we only collect personal information that is reasonably necessary to provide our
          services to you.
        </p>
        <h2 className="mt-5 text-[30px]">Collection and Use of Information</h2>
        <p className="mt-7 text-[20px]">
          We may collect personal information from you when you do any of the following on our
          website:
        </p>
        <p className="mt-5 text-[20px]">
          Enter any of our competitions, contests, sweepstakes, and surveys
          <br />
          Sign up to receive updates from us via email or social media channels
          <br />
          Use a mobile device or web browser to access our content
          <br />
          Contact us via email, social media, or on any similar technologies
          <br />
          When you mention us on social media
        </p>
        <p className="mt-5 text-[20px]">
          We may collect, hold, use, and disclose information for the following purposes, and
          personal information will not be further processed in a manner that is incompatible with
          these purposes:
        </p>
        <p className="mt-5 text-[20px]">
          to enable you to customize or personalize your experience of our website
          <br />
          to contact and communicate with you
          <br />
          for analytics, market research, and business development, including to operate and improve
          our website, associated applications, and associated social media platforms
          <br />
          for advertising and marketing, including to send you promotional information about our
          products and services and information about third parties that we consider may be of
          interest to you
          <br />
          to consider your employment application
          <br />
          to enable you to access and use our website, associated applications, and associated
          social media platforms
          <br />
          for internal record keeping and administrative purposes
          <br />
          to run competitions, sweepstakes, and/or offer additional benefits to you
          <br />
          to comply with our legal obligations and resolve any disputes that we may have
          <br />
          for security and fraud prevention, and to ensure that our sites and apps are safe, secure,
          and used in line with our terms of use
        </p>
        <p className="mt-5 text-[20px]">
          Please be aware that we may combine information we collect about you with general
          information or research data we receive from other trusted sources.
        </p>
        <p className="mt-5 text-[20px]">
          Security of Your Personal Information
          <br />
          When we collect and process personal information, and while we retain this information, we
          will protect it within commercially acceptable means to prevent loss and theft, as well as
          unapproved access, disclosure, copying, use, or modification.
        </p>
        <p className="mt-5 text-[20px]">
          Although we will do our best to protect the personal information you provide to us, we
          advise that no method of electronic transmission or storage is 100% secure, and no one can
          guarantee absolute data security. We will work with the situations that are applicable to
          us in respect of any data breach.
        </p>
        <p className="mt-5 text-[20px]">
          You are responsible for selecting any password and its overall security strength, ensuring
          the security of your own information within the bounds of our services.
        </p>
        <p className="mt-5 text-[20px]">
          How Long We Keep Your Personal Information <br />
          We keep your personal information only for as long as we need to. This time period may
          depend on what we are using your information for, in accordance with this privacy policy.
          If your personal information is no longer required, we will delete it or make it anonymous
          by removing all details that identify you.
        </p>
        <p className="mt-5 text-[20px]">
          However, if necessary, we may retain your personal information for our compliance with a
          legal, accounting, or reporting obligation or for archiving purposes in the public
          interest, scientific, or historical research purposes or statistical purposes.
        </p>
        <p className="mt-5 text-[20px]">
          Children’s Privacy <br />
          We do not aim any of our products or services directly at children under the age of 18,
          and we do not knowingly collect personal information about children under 18.
        </p>
        <p className="mt-5 text-[20px]">
          Disclosure of Personal Information to Third Parties <br />
          We may disclose personal information to:
        </p>
        <ul className="mt-5 ml-7 list-disc">
          <li className="text-[20px]">a parent, subsidiary, or affiliate of our company</li>
          <li className="text-[20px]">
            third party service providers for the purpose of enabling them to provide their
            services, for example, IT service providers, data storage, hosting and server providers,
            advertisers, or analytics platforms
          </li>
          <li className="text-[20px]">our employees, contractors, and/or related entities</li>
          <li className="text-[20px]">our existing or potential agents or business partners</li>
          <li className="text-[20px]">
            sponsors or promoters of any competition, sweepstakes, or promotion we run
          </li>
          <li className="text-[20px]">
            In order to establish trust, we work towards working with our users and cleaners that we
            would do the best we can in handling almost any situation that comes our way.
          </li>
          <li className="text-[20px]">
            third parties, including agents or sub-contractors, who assist us in providing
            information, products, services, or direct marketing to you
          </li>
          <li className="text-[20px]">third parties to collect and process data</li>
        </ul>
        <h2 className="mt-5 text-[30px]">International Transfers of Personal Information</h2>
        <p className="mt-7 text-[20px]">
          The personal information we collect is stored and/or processed where we or our partners,
          affiliates, and third-party providers maintain facilities. Please be aware that the
          locations to which we store, process, or transfer your personal information may not have
          the same data protection as the country in which you initially provided the information.
          If we transfer your personal information to third parties in other countries: (i) we will
          perform those transfers in accordance with the requirements of applicable situations; and
          (ii) we will protect the transferred personal information in accordance with this privacy
          policy.
        </p>
        <h2 className="mt-5 text-[30px]">Your use and Controlling Your Personal Information</h2>
        <p className="mt-7 text-[20px]">
          You always retain the right to withhold personal information from us, with the
          understanding that your experience of our website may be affected. We will not
          discriminate against you for exercising any of your rights over your personal information.
          If you do provide us with personal information you understand that we will collect, hold,
          use and disclose it in accordance with this privacy policy. You retain the right to
          request details of any personal information we hold about you.
        </p>
        <p className="mt-7 text-[20px]">
          If we receive personal information about you from a third party, we will protect it as set
          out in this privacy policy. If you are a third party providing personal information about
          somebody else, you represent and warrant that you have such person’s consent to provide
          the personal information to us.
        </p>
        <p className="mt-7 text-[20px]">
          If you have previously agreed to us using your personal information for direct marketing
          purposes, you may change your mind at any time. We will provide you with the ability to
          unsubscribe from our email-database or opt out of communications. Please be aware we may
          need to request specific information from you to help us confirm your identity.
        </p>
        <p className="mt-7 text-[20px]">
          If you believe that any information we hold about you is inaccurate, out of date,
          incomplete, irrelevant, or misleading, please contact us using the details provided in
          this privacy policy. We will take reasonable steps to correct any information found to be
          inaccurate, incomplete, misleading, or out of date.
        </p>
        <p className="mt-7 text-[20px]">
          If you believe that we have breached a relevant data protection and would like to make a
          complaint, please contact us using the details below and provide us with full details of
          the alleged breach. We will promptly investigate your complaint and respond to you, in
          writing, setting out the outcome of our investigation and the steps we will take to deal
          with your complaint. You also have the right to contact a third-party body or data
          protection authority in relation to your complaint.
        </p>
        <h2 className="mt-5 text-[30px]">Use of Cookies</h2>
        <p className="mt-7 text-[20px]">
          We use “cookies” to collect information about you and your activity across our site. A
          cookie is a small piece of data that our website stores on your computer, and accesses
          each time you visit, so we can understand how you use our site. This helps us serve you
          content based on preferences you have specified.
        </p>
        <h2 className="mt-5 text-[30px]">Extent of Our Policy</h2>
        <p className="mt-5 text-[20px]">
          Our website may link to external sites that are not operated by us. Please be aware that
          we have no control over the content and policies of those sites, and cannot accept
          responsibility or liability for their respective privacy practices.
        </p>
        <h2 className="mt-5 text-[30px]">Changes to This Policy</h2>
        <p className="mt-5 text-[20px]">
          At our discretion, we may change our privacy policy to reflect updates to our business
          processes, current acceptable business changes or third-party changes. If we decide to
          change this privacy policy, we will post the changes here at the same link by which you
          are accessing this privacy policy.
        </p>
        <p className="mt-5 text-[20px]">
          If required, we will get your permission or give you the opportunity to opt in to or opt
          out of, as applicable, any new uses of your personal information.
        </p>
        <h2 className="mt-5 text-[30px]">Contact Us</h2>
        <p className="mt-5 text-[20px]">
          For any questions or concerns regarding your privacy, you may contact us using the
          following details:
        </p>
        <p className="mt-10 text-[20px]">
          Balcony <br /> <Link href="mailto:info@balcony.co">info@balcony.co</Link>
        </p>
        <p className="mt-14 text-[20px]">Privacy Policy</p>
      </div>
    </main>
    <Footer />
  </>
);

export default Policy;
