import { NextPage } from 'next';

import { Footer } from '@/components/common';

type Props = object;

const Faq: NextPage<Props> = () => (
  <>
    <main className="pt-36 xl:pt-40 flex flex-col justify-center items-center mb-16">
      <div className="w-[90%] lg:w-4/5">
        <h1 className="text-[40px] lg:text-[50px] leading-[70%] lg:leading-normal">FAQ</h1>
        <h2 className="mt-5 text-[25px]">What is the purpose of this business?</h2>
        <ul className="ml-7 list-disc">
          <li className="text-[20px]">
            A workspace business, often referred to as a co-working space or shared office space,
            provides flexible work environments and services to individuals and businesses looking
            for professional office solutions without the commitment and overhead costs associated
            with traditional office leases. Here is a summary of key aspects of a workspace
            business. Overall, a workspace business provides a flexible and convenient solution for
            individuals and organizations seeking professional workspaces without the constraints of
            traditional office leases. Its success depends on factors such as location, amenities,
            community-building efforts, and the ability to adapt to the evolving needs of its
            clients.
          </li>
        </ul>
        <h2 className="mt-5 text-[25px]">What is the purpose of this business?</h2>
        <ul className="ml-7 list-disc">
          <li className="text-[20px]">
            Physical Facilities: Workspace businesses typically offer a range of office settings,
            including private offices, open desks, dedicated desks, meeting rooms, and communal
            areas. These spaces are equipped with office furniture, high-speed internet, and
            essential amenities like printing and coffee services.
          </li>
        </ul>
        <h2 className="mt-5 text-[25px]">Flexibility:</h2>
        <ul className="ml-7 list-disc">
          <li className="text-[20px]">
            One of the primary attractions of workspace businesses is the flexibility they provide.
            Clients can rent space on a daily, weekly, monthly, or longer-term basis, allowing them
            to scale their office needs as their business evolves.
          </li>
        </ul>
        <h2 className="mt-5 text-[25px]">Community and Networking:</h2>
        <ul className="ml-7 list-disc">
          <li className="text-[20px]">
            Many workspace providers foster a sense of community among their clients by organizing
            events, workshops, and networking opportunities. This can be particularly appealing to
            startups and freelancers looking to connect with like-minded professionals.
          </li>
        </ul>
        <h2 className="mt-5 text-[25px]">Location:</h2>
        <ul className="ml-7 list-disc">
          <li className="text-[20px]">
            Workspace businesses often have multiple locations in different cities or neighborhoods,
            giving clients access to prime business addresses and the ability to work in convenient
            locations.
          </li>
        </ul>
        <h2 className="mt-5 text-[25px]">Amenities:</h2>
        <ul className="ml-7 list-disc">
          <li className="text-[20px]">
            Beyond basic office infrastructure, workspace businesses may offer amenities such as
            reception services, mail handling, IT support, and kitchen facilities. Some even provide
            wellness amenities like fitness centers or meditation rooms.
          </li>
        </ul>
        <h2 className="mt-5 text-[25px]">Technology Infrastructure:</h2>
        <ul className="ml-7 list-disc">
          <li className="text-[20px]">
            Most places have reliable and high-speed internet, as well as modern technology
            infrastructure, are crucial for workspace businesses. They must ensure clients have
            access to the tools and connectivity they need to work efficiently.
          </li>
        </ul>
        <h2 className="mt-5 text-[25px]">Business Services:</h2>
        <ul className="ml-7 list-disc">
          <li className="text-[20px]">
            Some workspace businesses offer additional business services, such as virtual office
            solutions, administrative assistance, and concierge services, to help clients manage
            their day-to-day operations more effectively.
          </li>
        </ul>
        <h2 className="mt-5 text-[25px]">Cost Efficiency:</h2>
        <ul className="ml-7 list-disc">
          <li className="text-[20px]">
            For many businesses (small or big), freelancers, etc; using a workspace is
            cost-effective compared to leasing and maintaining a traditional office space. They can
            avoid long-term leases, utility bills, and other overhead costs.
          </li>
        </ul>
        <h2 className="mt-5 text-[25px]">Market Trends:</h2>
        <ul className="ml-7 list-disc">
          <li className="text-[20px]">
            For many businesses (small or big), freelancers, etc; using a workspace is
            cost-effective compared to leasing and maintaining a traditional office space. They can
            avoid long-term leases, utility bills, and other overhead costs.
          </li>
        </ul>
        <p className="mt-5 text-[20px]">FAQ</p>
      </div>
    </main>
    <Footer />
  </>
);

export default Faq;
