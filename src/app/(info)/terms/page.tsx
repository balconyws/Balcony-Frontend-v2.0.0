import { NextPage } from 'next';
import Link from 'next/link';

import { Footer } from '@/components/common';

type Props = object;

const Terms: NextPage<Props> = () => (
  <>
    <main className="pt-36 xl:pt-40 flex flex-col justify-center items-center mb-16">
      <div className="w-[90%] lg:w-4/5">
        <h1 className="text-[40px] lg:text-[50px] leading-[70%] lg:leading-normal">
          Terms of Services
        </h1>
        <p className="mt-5 text-[20px]">
          These Terms of Service are for your use of the website located at{' '}
          <Link href="https://www.balcony.co/" className="underline">
            https://www.balcony.co/
          </Link>{' '}
          and any related services provided by Balcony.
        </p>
        <p className="mt-5 text-[20px]">
          By accessing{' '}
          <Link href="https://www.balcony.co/" className="underline">
            https://www.balcony.co/
          </Link>{' '}
          you agree to abide by these Terms of Service and to comply with all applicable business
          service agreements. If you do not agree with these Terms of Service, you are not allowed
          from using or accessing this website or using any other services provided by Balcony.
        </p>
        <p className="mt-12 text-[20px]">
          We, Balcony, reserve the right to review and amend any of these Terms of Service at our
          sole discretion. Upon doing so, we will update this page. Any changes to these Terms of
          Service will take effect immediately from the date of publication.
        </p>
        <p className="mt-5 text-[20px]">
          These Terms of Service were last updated on 21 February 2021.
        </p>
        <h2 className="mt-5 text-[30px]">Amount of Use</h2>
        <p className="mt-5 text-[20px]">
          By using this website, you warrant on behalf of yourself, your users, and other parties
          you represent that you will not:
        </p>
        <ul className="mt-5 ml-7 list-disc">
          <li className="text-[20px]">
            modify, copy, prepare derivative works of, decompile, or reverse engineer any materials
            and software contained on this website;
          </li>
          <li className="text-[20px]">
            remove any copyright or other proprietary notations from any materials and software on
            this website;
          </li>
          <li className="text-[20px]">
            transfer the materials to another person or “mirror” the materials on any other server;
          </li>
          <li className="text-[20px]">
            knowingly or negligently use this website or any of its associated services in a way
            that abuses or disrupts our networks or any other service Balcony provides;
          </li>
          <li className="text-[20px]">
            use this website or its associated services to transmit or publish any harassing,
            indecent, obscene, or mis-informative material;
          </li>
          <li className="text-[20px]">
            use this website or its associated services in violation of any applicable business
            service agreements;
          </li>
          <li className="text-[20px]">
            use this website in conjunction with sending unauthorized advertising or spam;
          </li>
          <li className="text-[20px]">
            harvest, collect, or gather user data without the user’s consent; or
          </li>
          <li className="text-[20px]">
            use this website or its associated services in such a way that may break the User
            Agreement of privacy or other rights of third parties.
          </li>
        </ul>
        <h2 className="mt-5 text-[30px]">Business Structure</h2>
        <p className="mt-5 text-[20px]">
          The Business Structure in the materials contained in this website are owned by or licensed
          to Balcony which makes our brand distinctive from other businesses. We grant our users
          permission to download one copy of the materials for personal, non-commercial transitory
          use.
        </p>
        <p className="mt-5 text-[20px]">
          We are able to acquire a license, not a transfer of title. This license shall
          automatically terminate if you violate any of these restrictions or the Terms of Service,
          and may be terminated by Balcony at any time.
        </p>
        <h2 className="mt-5 text-[30px]">Liability</h2>
        <p className="mt-5 text-[20px]">
          Our website and the materials on our website are provided on an &apos;as is&apos; basis.
          To the extent permitted by business service agreements, Balcony makes no warranties,
          expressed or implied, and hereby disclaims and negates all other warranties including,
          without limitation, implied warranties or conditions of merchantability, fitness for a
          particular purpose, or non-infringement of Business Structure, or other violation of
          rights.
        </p>
        <p className="mt-5 text-[20px]">
          In no event shall Balcony or its suppliers be liable for any consequential loss suffered
          or incurred by you or any third party arising from the use or inability to use this
          website or the materials on this website, even if Balcony or an authorized representative
          has been notified, orally or in writing, of the possibility of such damage.
        </p>
        <p className="mt-5 text-[20px]">
          In the context of this agreement, “consequential loss” includes any consequential loss,
          indirect loss, real or anticipated loss of profit, loss of benefit, loss of revenue, loss
          of business, loss of goodwill, loss of opportunity, loss of savings, loss of reputation,
          loss of use and/or loss or corruption of data, whether under statute, contract, equity,
          tort (including negligence), indemnity, or otherwise.
        </p>
        <p className="mt-5 text-[20px]">
          Because some jurisdictions do not allow limitations on implied warranties, or limitations
          of liability for consequential or incidental damages, these limitations may not apply to
          you.
        </p>
        <h2 className="mt-5 text-[30px]">Accuracy of Materials</h2>
        <p className="mt-5 text-[20px]">
          The materials appearing on our website are not comprehensive and are for general
          information purposes only. Balcony does not warrant or make any representations concerning
          the accuracy, likely results, or reliability of the use of the materials on this website,
          or otherwise relating to such materials or on any resources linked to this website.
        </p>
        <h2 className="mt-5 text-[30px]">Links</h2>
        <p className="mt-5 text-[20px]">
          Balcony has not reviewed all of the sites linked to its website and is not responsible for
          the contents of any such linked site. The inclusion of any link does not imply
          endorsement, approval, or control by Balcony of the site. Use of any such linked site is
          at your own risk and we strongly advise you make your own investigations with respect to
          the suitability of those sites.
        </p>
        <h2 className="mt-5 text-[30px]">Suspend or Terminate</h2>
        <p className="mt-5 text-[20px]">
          We may suspend or terminate your right to use our website and terminate these Terms of
          Service immediately upon written notice to you for any breach of these Terms of Service.
        </p>
        <h2 className="mt-5 text-[30px]">Severance</h2>
        <p className="mt-5 text-[20px]">
          Any term of these Terms of Service which is wholly or partially void or unenforceable is
          severed to the extent that it is void or unenforceable. The validity of the remainder of
          these Terms of Service is not affected.
        </p>
        <h2 className="mt-5 text-[30px]">Business Service Agreements</h2>
        <p className="mt-5 text-[20px]">
          These Terms of Service are to be implemented during business operations, and at the time
          of our vendors/clients offering the service.
        </p>
      </div>
    </main>
    <Footer />
  </>
);

export default Terms;
