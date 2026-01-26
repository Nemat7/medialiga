import { motion } from "framer-motion";
import { Trophy, ChevronRight, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

interface Team {
  position: number;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

interface GroupData {
  groupA: Team[];
  groupB: Team[];
}

const TournamentStandings = () => {
  const [groupA, setGroupA] = useState<Team[]>([]);
  const [groupB, setGroupB] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<"A" | "B">("A");

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("https://www.mfltj.com/api/efootball/standings/");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GroupData = await response.json();
      setGroupA(data.groupA || []);
      setGroupB(data.groupB || []);
    } catch (err) {
      console.error("Error fetching standings:", err);
      setError("Не удалось загрузить турнирную таблицу");

      // Fallback на статические данные при ошибке
      setGroupA([
        { position: 1, name: "Thunder FC", played: 5, won: 4, drawn: 1, lost: 0, gf: 12, ga: 4, gd: 8, points: 13, form: ["W", "W", "D", "W", "W"] },
        { position: 2, name: "Digital Lions", played: 5, won: 3, drawn: 1, lost: 1, gf: 9, ga: 5, gd: 4, points: 10, form: ["W", "D", "W", "L", "W"] },
        { position: 3, name: "Cyber Eagles", played: 5, won: 3, drawn: 0, lost: 2, gf: 8, ga: 6, gd: 2, points: 9, form: ["L", "W", "W", "W", "L"] },
        { position: 4, name: "Neon Strikers", played: 5, won: 2, drawn: 2, lost: 1, gf: 7, ga: 5, gd: 2, points: 8, form: ["D", "W", "D", "W", "L"] },
        { position: 5, name: "Pixel Warriors", played: 5, won: 1, drawn: 1, lost: 3, gf: 5, ga: 9, gd: -4, points: 4, form: ["L", "L", "W", "D", "L"] },
        { position: 6, name: "Storm United", played: 5, won: 0, drawn: 1, lost: 4, gf: 3, ga: 11, gd: -8, points: 1, form: ["L", "D", "L", "L", "L"] },
      ]);

      setGroupB([
        { position: 1, name: "Blaze FC", played: 5, won: 4, drawn: 0, lost: 1, gf: 11, ga: 5, gd: 6, points: 12, form: ["W", "L", "W", "W", "W"] },
        { position: 2, name: "Shadow Wolves", played: 5, won: 3, drawn: 2, lost: 0, gf: 10, ga: 4, gd: 6, points: 11, form: ["D", "W", "W", "D", "W"] },
        { position: 3, name: "Volt Gaming", played: 5, won: 3, drawn: 1, lost: 1, gf: 9, ga: 6, gd: 3, points: 10, form: ["W", "D", "W", "L", "W"] },
        { position: 4, name: "Apex United", played: 5, won: 2, drawn: 1, lost: 2, gf: 7, ga: 7, gd: 0, points: 7, form: ["L", "W", "D", "W", "L"] },
        { position: 5, name: "Nova Esports", played: 5, won: 1, drawn: 1, lost: 3, gf: 4, ga: 8, gd: -4, points: 4, form: ["L", "L", "D", "W", "L"] },
        { position: 6, name: "Fury FC", played: 5, won: 0, drawn: 1, lost: 4, gf: 3, ga: 12, gd: -9, points: 1, form: ["L", "L", "L", "D", "L"] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();

    const interval = setInterval(() => {
      fetchStandings();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getFormColor = (result: "W" | "D" | "L") => {
    switch (result) {
      case "W": return "bg-green-500";
      case "D": return "bg-primary/50";
      case "L": return "bg-secondary";
    }
  };

  const getPositionStyle = (position: number) => {
    if (position <= 2) return "text-primary";
    if (position <= 4) return "text-blue-400";
    return "text-muted-foreground";
  };

  const getPositionBg = (position: number) => {
    if (position === 1) return "bg-yellow-500/10 border-yellow-500/20";
    if (position === 2) return "bg-gray-400/10 border-gray-400/20";
    if (position === 3) return "bg-orange-700/10 border-orange-700/20";
    if (position <= 4) return "bg-blue-500/5 border-blue-500/10";
    return "";
  };

  // Компактный вид для мобильных
  const renderMobileTable = (teams: Team[]) => (
    <div className="space-y-3 md:hidden">
      {teams.map((team, index) => (
        <motion.div
          key={team.position}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          className={`card-esports p-4 border-2 ${getPositionBg(team.position)}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold ${getPositionStyle(team.position)}`}>
                {team.position}
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm md:text-base">{team.name}</h4>
                <div className="flex gap-1 mt-1">
                  {team.form.map((result, i) => (
                    <span
                      key={i}
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-background ${getFormColor(result)}`}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-heading font-extrabold text-lg text-primary">{team.points}</div>
              <div className="text-xs text-muted-foreground">очков</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center border-t border-border/50 pt-3">
            <div>
              <div className="text-xs text-muted-foreground">И</div>
              <div className="font-semibold">{team.played}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">В</div>
              <div className="font-semibold text-green-400">{team.won}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Н</div>
              <div className="font-semibold">{team.drawn}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">П</div>
              <div className="font-semibold text-secondary">{team.lost}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mt-3">
            <div>
              <div className="text-xs text-muted-foreground">З</div>
              <div className="font-semibold">{team.gf}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">П</div>
              <div className="font-semibold">{team.ga}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Р</div>
              <div className={`font-semibold ${team.gd > 0 ? 'text-green-400' : team.gd < 0 ? 'text-secondary' : ''}`}>
                {team.gd > 0 ? `+${team.gd}` : team.gd}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Полная таблица для десктопа
  const renderDesktopTable = (teams: Team[], groupName: string) => (
    <div className="hidden md:block">
      <h3 className="font-heading font-extrabold text-xl md:text-2xl mb-4 md:mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
        <span className="text-secondary">Группа {groupName}</span>
      </h3>
      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr className="text-left text-xs md:text-sm uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-3 md:px-4 text-center w-12">#</th>
              <th className="py-3 px-3 md:px-4 min-w-[150px]">Команда</th>
              <th className="py-3 px-2 text-center w-12" title="Сыграно">И</th>
              <th className="py-3 px-2 text-center w-12" title="Победы">В</th>
              <th className="py-3 px-2 text-center w-12" title="Ничьи">Н</th>
              <th className="py-3 px-2 text-center w-12" title="Поражения">П</th>
              <th className="py-3 px-2 text-center w-12" title="Забито">З</th>
              <th className="py-3 px-2 text-center w-12" title="Пропущено">П</th>
              <th className="py-3 px-2 text-center w-12" title="Разница">Р</th>
              <th className="py-3 px-3 md:px-4 text-center w-16" title="Очки">О</th>
              <th className="py-3 px-3 md:px-4 text-center min-w-[100px]">Форма</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <motion.tr
                key={team.position}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border-t border-border/50 hover:bg-muted/20 transition-colors"
              >
                <td className={`py-3 px-3 md:px-4 text-center font-heading font-extrabold ${getPositionStyle(team.position)}`}>
                  {team.position}
                </td>
                <td className="py-3 px-3 md:px-4 font-heading font-bold text-sm md:text-base">
                  {team.name}
                </td>
                <td className="py-3 px-2 text-center text-sm">{team.played}</td>
                <td className="py-3 px-2 text-center text-sm text-green-400 font-semibold">{team.won}</td>
                <td className="py-3 px-2 text-center text-sm">{team.drawn}</td>
                <td className="py-3 px-2 text-center text-sm text-secondary">{team.lost}</td>
                <td className="py-3 px-2 text-center text-sm font-semibold">{team.gf}</td>
                <td className="py-3 px-2 text-center text-sm">{team.ga}</td>
                <td className="py-3 px-2 text-center text-sm font-semibold">
                  <span className={team.gd > 0 ? "text-green-400" : team.gd < 0 ? "text-secondary" : ""}>
                    {team.gd > 0 ? `+${team.gd}` : team.gd}
                  </span>
                </td>
                <td className="py-3 px-3 md:px-4 text-center font-heading font-extrabold text-base md:text-lg text-primary">
                  {team.points}
                </td>
                <td className="py-3 px-3 md:px-4">
                  <div className="flex gap-1 justify-center">
                    {team.form.map((result, i) => (
                      <span
                        key={i}
                        className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-bold text-background ${getFormColor(result)}`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <section id="standings" className="py-12 md:py-20 relative">
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(ellipse at top, hsl(338, 80%, 63%, 0.1) 0%, transparent 50%)' }}
      />

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-4">
            <Trophy className="inline-block w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 text-secondary" />
            Турнирная <span className="text-secondary">таблица</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Актуальное положение команд в группах турнира
          </p>
        </motion.div>

        {/* Мобильный переключатель групп */}
        <div className="flex justify-center mb-6 md:hidden">
          <div className="flex bg-muted/30 rounded-lg p-1">
            <button
              onClick={() => setActiveGroup("A")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeGroup === "A" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Группа A
            </button>
            <button
              onClick={() => setActiveGroup("B")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeGroup === "B" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Группа B
            </button>
          </div>
        </div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-destructive"
          >
            <p>{error}</p>
            <button
              onClick={fetchStandings}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Попробовать снова
            </button>
          </motion.div>
        )}

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 md:mt-12"
          >
            {/* Мобильная версия (одна группа за раз) */}
            <div className="md:hidden">
              {activeGroup === "A" && renderMobileTable(groupA)}
              {activeGroup === "B" && renderMobileTable(groupB)}
            </div>

            {/* Десктоп версия (обе группы рядом) */}
            <div className="hidden md:grid lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="card-esports p-4 md:p-6">
                {renderDesktopTable(groupA, "A")}
              </div>
              <div className="card-esports p-4 md:p-6">
                {renderDesktopTable(groupB, "B")}
              </div>
            </div>

            {/* Легенда */}
            <div className="mt-8 md:mt-10 p-4 md:p-6 card-esports">
              <h4 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-secondary" />
                Обозначения
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-400">1</span>
                  </div>
                  <span className="text-sm">1 место</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-400/10 border border-gray-400/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-400">2</span>
                  </div>
                  <span className="text-sm">2 место</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-700/10 border border-orange-700/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-400">3</span>
                  </div>
                  <span className="text-sm">3 место</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[8px] font-bold text-background">W</span>
                    <span className="w-4 h-4 rounded-full bg-primary/50 flex items-center justify-center text-[8px] font-bold text-background">D</span>
                    <span className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold text-background">L</span>
                  </div>
                  <span className="text-sm">Форма</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>И - сыграно, В - победы, Н - ничьи, П - поражения, З - забито, П - пропущено, Р - разница, О - очки</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TournamentStandings;