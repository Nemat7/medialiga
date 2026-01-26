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
      <section id="live" className="py-12 md:py-20 relative overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-4">
              <Radio className="inline-block w-6 h-6 md:w-8 md:h-8 mr-2 text-secondary animate-pulse" />
              Прямой <span className="text-secondary">Эфир</span>
            </h2>
          </div>
          <div className="max-w-4xl mx-auto mt-8 md:mt-12">
            <div className="card-esports p-6 md:p-12 text-center">
              <div className="animate-pulse">
                <div className="h-6 md:h-8 bg-muted rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-48 md:h-64 bg-muted rounded mb-6"></div>
                <div className="h-3 md:h-4 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !liveMatch) {
    return (
      <section id="live" className="py-12 md:py-20 relative overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-4">
              <Radio className="inline-block w-6 h-6 md:w-8 md:h-8 mr-2 text-secondary animate-pulse" />
              Прямой <span className="text-secondary">Эфир</span>
            </h2>
          </div>
          <div className="max-w-4xl mx-auto mt-8 md:mt-12">
            <div className="card-esports p-6 md:p-12 text-center">
              <p className="text-muted-foreground text-base md:text-lg">Нет активных трансляций</p>
              <p className="text-sm text-muted-foreground mt-2 md:mt-4">
                Следующий матч скоро будет объявлен
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="live" className="py-12 md:py-20 relative overflow-hidden">
      {/* Background glow - скрыть на очень маленьких экранах */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] md:w-[800px] md:h-[400px] bg-secondary/10 rounded-full blur-3xl" />

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-4">
            <Radio className="inline-block w-6 h-6 md:w-8 md:h-8 mr-2 text-secondary animate-pulse" />
            Прямой <span className="text-secondary">Эфир</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl mx-auto px-2">
            Смотрите трансляцию главного матча сезона в прямом эфире
          </p>
        </motion.div>

        <div className="mt-8 md:mt-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="card-esports overflow-hidden relative rounded-xl md:rounded-2xl">
              {/* Live badge - адаптивный размер и позиция */}
              {liveMatch.is_live && (
                <div className="absolute top-3 left-3 md:top-6 md:left-6 z-20 flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 rounded-full bg-secondary text-secondary-foreground shadow-lg text-xs md:text-sm">
                  <Radio className="w-3 h-3 md:w-5 md:h-5 animate-pulse" />
                  <span className="font-bold uppercase">Live Now</span>
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
                    <span className="text-3xl md:text-4xl">⚽</span>
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
                    <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl md:shadow-2xl">
                      <Play className="w-8 h-8 md:w-12 md:h-12 text-secondary-foreground fill-current ml-1 md:ml-2" />
                    </div>
                  </div>
                </a>
              </div>

              {/* Match Info */}
              <div className="p-4 md:p-6 lg:p-8 text-center">
                {/* Заголовок матча (если есть) */}
                {liveMatch.title && (
                  <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider block mb-2 md:mb-3">
                    {liveMatch.title}
                  </span>
                )}

                {/* Команды */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 mt-4 mb-6">
                  {/* Хозяева */}
                  <div className="text-center w-full md:w-auto">
                    <div className="font-heading text-xl md:text-2xl lg:text-3xl font-extrabold break-words">
                      {liveMatch.home_team}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">Хозяева</div>
                  </div>

                  {/* VS */}
                  <div className="px-3 py-1 md:px-4 md:py-2 bg-secondary/20 rounded-lg my-2 md:my-0">
                    <span className="text-lg md:text-xl lg:text-2xl font-heading font-extrabold text-secondary">
                      VS
                    </span>
                  </div>

                  {/* Гости */}
                  <div className="text-center w-full md:w-auto">
                    <div className="font-heading text-xl md:text-2xl lg:text-3xl font-extrabold break-words">
                      {liveMatch.away_team}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">Гости</div>
                  </div>
                </div>

                {/* Статус матча (если не live) */}
                {!liveMatch.is_live && liveMatch.status && (
                  <div className="mb-4 md:mb-6">
                    <span className={`inline-block px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold ${
                      liveMatch.status === 'upcoming'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {liveMatch.status === 'upcoming' ? 'Предстоящий матч' : 'Завершенный матч'}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <a
                    href={liveMatch.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-esports btn-accent inline-flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 lg:px-8 py-3 md:py-4 text-sm md:text-base lg:text-lg w-full sm:w-auto"
                  >
                    <Youtube className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                    <span className="truncate">Смотреть трансляцию</span>
                    <ExternalLink className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                  </a>

                  <button
                    onClick={fetchLiveMatch}
                    className="btn-esports inline-flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 lg:px-8 py-3 md:py-4 text-sm md:text-base lg:text-lg border border-border hover:border-secondary transition-colors w-full sm:w-auto"
                  >
                    <Play className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                    <span>Обновить</span>
                  </button>
                </div>

                {/* Дополнительная информация (на десктопе) */}
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border/50 hidden md:block">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    📍 Cyber Gym | 🏆 E Football Media League
                  </p>
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
            className="text-center mt-8 md:mt-12 px-2"
          >
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              Подпишитесь на наш канал, чтобы не пропустить следующие трансляции
            </p>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-secondary hover:underline font-semibold text-sm md:text-base"
            >
              <Youtube className="w-4 h-4 md:w-5 md:h-5" />
              Перейти на YouTube канал
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LiveMatches;