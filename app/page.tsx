import Hero from './components/ui/Hero';
import AmbassadorStatus from './components/ui/AmbassadorStatus';
import MissionGrid from './components/ui/MissionGrid';
import WorkshopCard from './components/ui/WorkshopCard';
import ContactCard from './components/ui/ContactCard';
import Footer from './components/ui/Footer';
import { workshops } from './data/workshops';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />

      <MissionGrid />
      
      <section className="bg-white py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center relative pb-4">
            🎓 工作坊
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded" />
          </h2>
          <div className="grid gap-6">
            {workshops.map(workshop => (
              <WorkshopCard key={workshop.id} workshop={workshop} />
            ))}
          </div>
        </div>
      </section>

      <AmbassadorStatus />

      <ContactCard />
      
      <Footer />
    </main>
  );
}