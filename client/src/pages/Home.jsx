import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FloatingActions from '../components/layout/FloatingActions';
import Hero from '../components/sections/Hero';
import Departments from '../components/sections/Departments';
import Doctors from '../components/sections/Doctors';
import Services from '../components/sections/Services';
import Testimonials from '../components/sections/Testimonials';
import Gallery from '../components/sections/Gallery';
import TimingsContact from '../components/sections/TimingsContact';
import CtaBanner from '../components/sections/CtaBanner';
import FAQ from '../components/sections/FAQ';
import Loader from '../components/common/Loader';
import useFetch from '../hooks/useFetch';
import { getHomeData } from '../api/publicApi';

export default function Home() {
  const { data, loading, error } = useFetch(getHomeData);
  const { hash } = useLocation();

  useEffect(() => {
    if (data?.settings?.clinic_name) document.title = data.settings.clinic_name;
  }, [data]);

  // Arriving from another page via "/#doctors" etc. — scroll once the sections exist
  useEffect(() => {
    if (!data || !hash) return;
    const el = document.querySelector(hash);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }));
  }, [data, hash]);

  if (loading) return <Loader fullScreen />;
  if (error || !data) {
    return (
      <div className="page-error">
        <div>
          <h1>We'll be right back</h1>
          <p>The website couldn't load. Please make sure the server is running and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar settings={data.settings || {}} />
      <main>
        <Hero hero={data.hero} stats={data.stats} />
        <Departments heading={data.sections?.departments} departments={data.departments} />
        <Doctors heading={data.sections?.doctors} doctors={data.doctors} />
        <Services heading={data.sections?.services} services={data.services} />
        <Testimonials heading={data.sections?.testimonials} testimonials={data.testimonials} />
        <Gallery heading={data.sections?.gallery} gallery={data.gallery} />
        <TimingsContact heading={data.sections?.contact} timings={data.timings} settings={data.settings || {}} />
        <FAQ heading={data.sections?.faq} faqs={data.faqs} settings={data.settings || {}} />
        <CtaBanner content={data.sections?.cta} phone={data.settings?.phone} />
      </main>
      <Footer settings={data.settings || {}} timings={data.timings} />
      <FloatingActions settings={data.settings || {}} />
    </>
  );
}
