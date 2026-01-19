import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
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

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Замените этот URL на ваш реальный эндпоинт
      const response = await fetch("https://www.mfltj.com/api/efootball/standings/");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GroupData = await response.json();
      setGroupA(data.groupA || []);
      setGroupB(data.groupB || []);
    } catch (err) {
      console.error("Error fetching standings:", err);
      setError("Failed to load tournament standings");

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

    // Опционально: обновление данных каждые 60 секунд
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
    if (position <= 2) return "text-primary glow-text";
    return "text-muted-foreground";
  };

  const renderTable = (teams: Team[], groupName: string) => (
    <div className="mb-12 last:mb-0">
      <h3 className="font-heading font-extrabold text-2xl mb-6 flex items-center gap-2">
        <span className="text-secondary">{groupName}</span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-2">#</th>
              <th className="py-3 px-2">Team</th>
              <th className="py-3 px-2 text-center">P</th>
              <th className="py-3 px-2 text-center">W</th>
              <th className="py-3 px-2 text-center">D</th>
              <th className="py-3 px-2 text-center">L</th>
              <th className="py-3 px-2 text-center">GF</th>
              <th className="py-3 px-2 text-center">GA</th>
              <th className="py-3 px-2 text-center">GD</th>
              <th className="py-3 px-2 text-center">Pts</th>
              <th className="py-3 px-2 text-center">Form</th>
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
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className={`py-3 px-2 font-heading font-extrabold ${getPositionStyle(team.position)}`}>
                  {team.position}
                </td>
                <td className="py-3 px-2 font-heading font-bold">{team.name}</td>
                <td className="py-3 px-2 text-center text-muted-foreground text-sm">{team.played}</td>
                <td className="py-3 px-2 text-center text-sm">{team.won}</td>
                <td className="py-3 px-2 text-center text-muted-foreground text-sm">{team.drawn}</td>
                <td className="py-3 px-2 text-center text-muted-foreground text-sm">{team.lost}</td>
                <td className="py-3 px-2 text-center text-sm">{team.gf}</td>
                <td className="py-3 px-2 text-center text-muted-foreground text-sm">{team.ga}</td>
                <td className="py-3 px-2 text-center text-sm">
                  <span className={team.gd > 0 ? "text-green-400" : team.gd < 0 ? "text-secondary" : ""}>
                    {team.gd > 0 ? `+${team.gd}` : team.gd}
                  </span>
                </td>
                <td className="py-3 px-2 text-center font-heading font-extrabold text-lg text-primary glow-text">
                  {team.points}
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-1 justify-center">
                    {team.form.map((result, i) => (
                      <span
                        key={i}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-background ${getFormColor(result)}`}
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
    <section id="standings" className="py-20 relative">
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(ellipse at top, hsl(338, 80%, 63%, 0.1) 0%, transparent 50%)' }}
      />

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title gradient-border pb-4">
            <Trophy className="inline-block w-10 h-10 mr-3 text-secondary" />
            League <span className="text-secondary">Standings</span>
          </h2>
        </motion.div>

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
              Retry
            </button>
          </motion.div>
        )}

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card-esports p-6">
                {renderTable(groupA, "Group A")}
              </div>
              <div className="card-esports p-6">
                {renderTable(groupB, "Group B")}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TournamentStandings;


