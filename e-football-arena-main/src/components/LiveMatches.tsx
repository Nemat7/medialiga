import { motion } from "framer-motion";
import { Play, Radio, ExternalLink, Youtube } from "lucide-react";

interface LiveMatch {
  id: number;
  title: string;
  teamA: string;
  teamB: string;
  videoId: string;
  isLive: boolean;
  viewers?: number;
}

const liveMatches: LiveMatch[] = [
  {
    id: 1,
    title: "Quarter Final - Match 1",
    teamA: "Pixel Warriors",
    teamB: "Storm United",
    videoId: "mleAl-Z_uTQ",
    isLive: true,
//     viewers: 2847,
  },
  {
    id: 2,
    title: "Group Stage - Highlights",
    teamA: "Thunder FC",
    teamB: "Cyber Eagles",
    videoId: "dQw4w9WgXcQ",
    isLive: false,
  },
  {
    id: 3,
    title: "Week 4 - Best Moments",
    teamA: "Digital Lions",
    teamB: "Neon Strikers",
    videoId: "dQw4w9WgXcQ",
    isLive: false,
  },
];

const LiveMatches = () => {
  return (
    <section id="live" className="py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title gradient-border pb-4">
            <Radio className="inline-block w-10 h-10 mr-3 text-secondary animate-pulse" />
            Live <span className="text-secondary">Matches</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mt-12">
          {/* Featured Live Stream */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:row-span-2"
          >
            <div className="card-esports overflow-hidden h-full">
              {/* Live badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-bold uppercase">Live Now</span>
              </div>
              
              {/* Video thumbnail */}
              <div className="relative aspect-video bg-muted">
                <img
                  src={`https://img.youtube.com/vi/${liveMatches[0].videoId}/maxresdefault.jpg`}
                  alt={liveMatches[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/40 flex items-center justify-center group cursor-pointer hover:bg-background/30 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-10 h-10 text-secondary-foreground fill-current ml-1" />
                  </div>
                </div>
              </div>
              
              {/* Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{liveMatches[0].title}</span>
                  {liveMatches[0].viewers && (
                    <span className="text-sm text-secondary font-medium">
                      {liveMatches[0].viewers.toLocaleString()} watching
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-heading font-extrabold mb-4">
                  {liveMatches[0].teamA} <span className="text-secondary">VS</span> {liveMatches[0].teamB}
                </h3>
                <a
                  href={`https://youtube.com/watch?v=${liveMatches[0].videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-esports btn-accent inline-flex items-center gap-2 w-full justify-center"
                >
                  <Youtube className="w-5 h-5" />
                  Watch on YouTube
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Other videos */}
          <div className="space-y-4">
            {liveMatches.slice(1).map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-esports overflow-hidden hover:scale-[1.02] transition-transform"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Thumbnail */}
                  <div className="relative sm:w-48 aspect-video sm:aspect-auto">
                    <img
                      src={`https://img.youtube.com/vi/${match.videoId}/mqdefault.jpg`}
                      alt={match.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-background/40 flex items-center justify-center group cursor-pointer hover:bg-background/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 p-4">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {match.title}
                    </span>
                    <h4 className="font-heading font-bold text-lg mt-1">
                      {match.teamA} <span className="text-secondary">vs</span> {match.teamB}
                    </h4>
                    <a
                      href={`https://youtube.com/watch?v=${match.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-secondary hover:underline mt-2"
                    >
                      Watch Now <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveMatches;
