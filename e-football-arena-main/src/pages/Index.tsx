import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MatchSchedule from "@/components/MatchSchedule";
import TournamentStandings from "@/components/TournamentStandings";
import LiveMatches from "@/components/LiveMatches";
import Partners from "@/components/Partners";
import ParticipantTeams from "@/components/ParticipantTeams";
import Footer from "@/components/Footer";


const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <MatchSchedule />
        <LiveMatches />
        <TournamentStandings />
        <ParticipantTeams />
        <Partners />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
