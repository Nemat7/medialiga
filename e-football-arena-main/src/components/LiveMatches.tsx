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
    // title: "Финальный матч сезона",
    teamA: "Media United",
    teamB: "News Network",
    videoId: "dQw4w9WgXcQ",
    isLive: true,
    viewers: 3150,
  },
];

const LiveMatches = () => {
  const mainMatch = liveMatches[0];

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
          className="text-center"
        >
          <h2 className="section-title gradient-border pb-4">
            <Radio className="inline-block w-10 h-10 mr-3 text-secondary animate-pulse" />
            Прямой <span className="text-secondary">Эфир</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Смотрите трансляцию главного матча сезона в прямом эфире
          </p>
        </motion.div>

        <div className="mt-12 max-w-4xl mx-auto">
          {/* Main Live Stream */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="card-esports overflow-hidden relative">
              {/* Live badge */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground shadow-lg">
                <Radio className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-bold uppercase">Live Now</span>
              </div>

              {/* Viewer count */}
              {/* {mainMatch.viewers && (
                <div className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border">
                  <span className="text-sm font-bold text-secondary">
                    {mainMatch.viewers.toLocaleString()} зрителей
                  </span>
                </div>
              )} */}

              {/* Video thumbnail */}
              <div className="relative aspect-video bg-muted">
                <img
                  src={`https://img.youtube.com/vi/${mainMatch.videoId}/maxresdefault.jpg`}
                  alt={mainMatch.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/30 flex items-center justify-center group cursor-pointer hover:bg-background/20 transition-colors">
                  <div className="relative">
                    <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-50"></div>
                    <div className="relative w-24 h-24 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                      <Play className="w-12 h-12 text-secondary-foreground fill-current ml-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Info */}
              <div className="p-8 text-center">
                <span className="text-sm text-muted-foreground uppercase tracking-wider">
                  {mainMatch.title}
                </span>

                <div className="flex items-center justify-center gap-4 mt-4 mb-6">
                  <div className="text-center">
                    <div className="font-heading text-3xl font-extrabold">{mainMatch.teamA}</div>
                    <div className="text-sm text-muted-foreground mt-1">Команда А</div>
                  </div>

                  <div className="px-4 py-2 bg-secondary/20 rounded-lg">
                    <span className="text-2xl font-heading font-extrabold text-secondary">VS</span>
                  </div>

                  <div className="text-center">
                    <div className="font-heading text-3xl font-extrabold">{mainMatch.teamB}</div>
                    <div className="text-sm text-muted-foreground mt-1">Команда Б</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={`https://youtube.com/watch?v=${mainMatch.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-esports btn-accent inline-flex items-center gap-3 px-8 py-4 text-lg"
                  >
                    <Youtube className="w-6 h-6" />
                    Смотреть на YouTube
                    <ExternalLink className="w-5 h-5" />
                  </a>

                  <button className="btn-esports inline-flex items-center gap-3 px-8 py-4 text-lg border border-border hover:border-secondary transition-colors">
                    <Play className="w-6 h-6" />
                    Следующий матч
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-border/50">
                  {/* <p className="text-sm text-muted-foreground">
                    📍 Стадион: Media Football Arena | ⏰ Начало: 19:00 МСК | 🏆 Турнир: Media Football League
                  </p> */}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground mb-4">
              Подпишитесь на наш канал, чтобы не пропустить следующие трансляции
            </p>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-secondary hover:underline font-semibold"
            >
              <Youtube className="w-5 h-5" />
              Перейти на YouTube канал
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LiveMatches;