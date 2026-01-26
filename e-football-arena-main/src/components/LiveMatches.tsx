import { motion } from "framer-motion";
import { Play, Radio, ExternalLink, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

interface LiveMatch {
  id: number;
  title: string;
  home_team: string;
  away_team: string;
  video_url: string;
  video_id: string;
  status: string;
  youtube_thumbnail?: string;
  is_live: boolean;
}

const LiveMatches = () => {
  const [liveMatch, setLiveMatch] = useState<LiveMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveMatch();
  }, []);

  const fetchLiveMatch = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://www.mfltj.com/api/efootball/featured-match/');

      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных');
      }

      const data = await response.json();
      setLiveMatch(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      console.error('Error fetching live match:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="live" className="py-20 relative overflow-hidden">
        <div className="container px-4">
          <div className="text-center">
            <h2 className="section-title gradient-border pb-4">
              <Radio className="inline-block w-10 h-10 mr-3 text-secondary animate-pulse" />
              Прямой <span className="text-secondary">Эфир</span>
            </h2>
          </div>
          <div className="max-w-4xl mx-auto mt-12">
            <div className="card-esports p-12 text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-64 bg-muted rounded mb-6"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !liveMatch) {
    return (
      <section id="live" className="py-20 relative overflow-hidden">
        <div className="container px-4">
          <div className="text-center">
            <h2 className="section-title gradient-border pb-4">
              <Radio className="inline-block w-10 h-10 mr-3 text-secondary animate-pulse" />
              Прямой <span className="text-secondary">Эфир</span>
            </h2>
          </div>
          <div className="max-w-4xl mx-auto mt-12">
            <div className="card-esports p-12 text-center">
              <p className="text-muted-foreground">Нет активных трансляций</p>
              <p className="text-sm text-muted-foreground mt-2">
                Следующий матч скоро будет объявлен
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
        </motion.div>

        <div className="mt-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="card-esports overflow-hidden relative">
              {/* Live badge */}
              {liveMatch.is_live && (
                <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground shadow-lg">
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-bold uppercase">Live Now</span>
                </div>
              )}

              {/* Video thumbnail */}
              <div className="relative aspect-video bg-muted">
                {liveMatch.youtube_thumbnail ? (
                  <img
                    src={liveMatch.youtube_thumbnail}
                    alt={liveMatch.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                    <span className="text-4xl">⚽</span>
                  </div>
                )}
                <a
                  href={liveMatch.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-background/30 flex items-center justify-center group cursor-pointer hover:bg-background/20 transition-colors"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-50"></div>
                    <div className="relative w-24 h-24 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                      <Play className="w-12 h-12 text-secondary-foreground fill-current ml-2" />
                    </div>
                  </div>
                </a>
              </div>

              {/* Match Info */}
              <div className="p-8 text-center">
                <div className="flex items-center justify-center gap-6 mt-4 mb-6">
                  {/* Хозяева */}
                  <div className="text-center">
                    <div className="font-heading text-3xl font-extrabold">{liveMatch.home_team}</div>
                    <div className="text-sm text-muted-foreground mt-1">Хозяева</div>
                  </div>

                  {/* VS */}
                  <div className="px-4 py-2 bg-secondary/20 rounded-lg">
                    <span className="text-2xl font-heading font-extrabold text-secondary">VS</span>
                  </div>

                  {/* Гости */}
                  <div className="text-center">
                    <div className="font-heading text-3xl font-extrabold">{liveMatch.away_team}</div>
                    <div className="text-sm text-muted-foreground mt-1">Гости</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={liveMatch.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-esports btn-accent inline-flex items-center gap-3 px-8 py-4 text-lg"
                  >
                    <Youtube className="w-6 h-6" />
                    Смотреть трансляцию
                    <ExternalLink className="w-5 h-5" />
                  </a>

                  <button
                    onClick={fetchLiveMatch}
                    className="btn-esports inline-flex items-center gap-3 px-8 py-4 text-lg border border-border hover:border-secondary transition-colors"
                  >
                    <Play className="w-6 h-6" />
                    Обновить
                  </button>
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