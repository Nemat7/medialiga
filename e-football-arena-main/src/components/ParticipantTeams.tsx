import { Users, Trophy, Target } from "lucide-react";

const teams = [
  {
    id: 1,
    name: "Media United",
    image: "/static/efootball/assets/team-logos/Калапоча.png", // локальный путь
    color: "from-red-500 to-red-700",
    players: [
      { name: "Alex Johnson", role: "Captain", image: "/src/assets/player-photos/alex-johnson.jpg" },
      { name: "Mike Smith", role: "Striker", image: "/src/assets/player-photos/mike-smith.jpg" },
      { name: "David Brown", role: "Midfielder", image: "/src/assets/player-photos/david-brown.jpg" },
    ],
    stats: { wins: 4, goals: 12 },
  },
  {
    id: 2,
    name: "News Network",
    image: "/src/assets/team-logos/Криф.png", // локальный путь
    color: "from-blue-500 to-blue-700",
    players: [
      { name: "James Wilson", role: "Captain", image: "/src/assets/player-photos/james-wilson.jpg" },
      { name: "Tom Anderson", role: "Goalkeeper", image: "/src/assets/player-photos/tom-anderson.jpg" },
      { name: "Chris Taylor", role: "Defender", image: "/src/assets/player-photos/chris-taylor.jpg" },
    ],
    stats: { wins: 5, goals: 15 },
  },
  {
    id: 3,
    name: "TV Titans",
    image: "/src/assets/team-logos/Менчос.png", // локальный путь
    color: "from-purple-500 to-purple-700",
    players: [
      { name: "Ryan Garcia", role: "Captain", image: "/src/assets/player-photos/ryan-garcia.jpg" },
      { name: "Kevin Lee", role: "Striker", image: "/src/assets/player-photos/kevin-lee.jpg" },
      { name: "Brian White", role: "Midfielder", image: "/src/assets/player-photos/brian-white.jpg" },
    ],
    stats: { wins: 3, goals: 10 },
  },
  {
    id: 4,
    name: "Press FC",
    image: "/src/assets/team-logos/Персы.png", // локальный путь
    color: "from-green-500 to-green-700",
    players: [
      { name: "Sam Miller", role: "Captain", image: "/src/assets/player-photos/sam-miller.jpg" },
      { name: "Jack Davis", role: "Defender", image: "/src/assets/player-photos/jack-davis.jpg" },
      { name: "Matt Wilson", role: "Midfielder", image: "/src/assets/player-photos/matt-wilson.jpg" },
    ],
    stats: { wins: 3, goals: 9 },
  },
  {
    id: 5,
    name: "Broadcast XI",
    image: "/src/assets/team-logos/Поизд.png", // локальный путь
    color: "from-orange-500 to-orange-700",
    players: [
      { name: "Nick Brown", role: "Captain", image: "/src/assets/player-photos/nick-brown.jpg" },
      { name: "Eric Jones", role: "Striker", image: "/src/assets/player-photos/eric-jones.jpg" },
      { name: "Paul Martin", role: "Goalkeeper", image: "/src/assets/player-photos/paul-martin.jpg" },
    ],
    stats: { wins: 2, goals: 7 },
  },
  {
    id: 6,
    name: "Digital Stars",
    image: "/src/assets/team-logos/Себистон.png", // локальный путь
    color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Steve Clark", role: "Captain", image: "/src/assets/player-photos/steve-clark.jpg" },
      { name: "Mark Lewis", role: "Midfielder", image: "/src/assets/player-photos/mark-lewis.jpg" },
      { name: "Dan Moore", role: "Defender", image: "/src/assets/player-photos/dan-moore.jpg" },
    ],
    stats: { wins: 1, goals: 5 },
  },
  {
    id: 7,
    name: "Digital Stars",
    image: "/src/assets/team-logos/смузи.png", // локальный путь
    color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Steve Clark", role: "Captain", image: "/src/assets/player-photos/steve-clark.jpg" },
      { name: "Mark Lewis", role: "Midfielder", image: "/src/assets/player-photos/mark-lewis.jpg" },
      { name: "Dan Moore", role: "Defender", image: "/src/assets/player-photos/dan-moore.jpg" },
    ],
    stats: { wins: 1, goals: 5 },
  },
  {
    id: 8,
    name: "Digital Stars",
    image: "/src/assets/team-logos/Сомони.png", // локальный путь
    color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Steve Clark", role: "Captain", image: "/src/assets/player-photos/steve-clark.jpg" },
      { name: "Mark Lewis", role: "Midfielder", image: "/src/assets/player-photos/mark-lewis.jpg" },
      { name: "Dan Moore", role: "Defender", image: "/src/assets/player-photos/dan-moore.jpg" },
    ],
    stats: { wins: 1, goals: 5 },
  },
  {
    id: 9,
    name: "Digital Stars",
    image: "/src/assets/team-logos/Фавик.png", // локальный путь
    color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Steve Clark", role: "Captain", image: "/src/assets/player-photos/steve-clark.jpg" },
      { name: "Mark Lewis", role: "Midfielder", image: "/src/assets/player-photos/mark-lewis.jpg" },
      { name: "Dan Moore", role: "Defender", image: "/src/assets/player-photos/dan-moore.jpg" },
    ],
    stats: { wins: 1, goals: 5 },
  },
  {
    id: 10,
    name: "Digital Stars",
    image: "/src/assets/team-logos/хамако 4.png", // локальный путь
    color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Steve Clark", role: "fft_logo 1", image: "/src/assets/player-photos/steve-clark.jpg" },
      { name: "Mark Lewis", role: "Midfielder", image: "/src/assets/player-photos/mark-lewis.jpg" },
      { name: "Dan Moore", role: "Defender", image: "/src/assets/player-photos/dan-moore.jpg" },
    ],
    stats: { wins: 1, goals: 5 },
  },
  {
    id: 11,
    name: "Digital Stars",
    image: "/src/assets/team-logos/fft_logo 1.png", // локальный путь
    color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Steve Clark", role: "Captain", image: "/src/assets/player-photos/steve-clark.jpg" },
      { name: "Mark Lewis", role: "Midfielder", image: "/src/assets/player-photos/mark-lewis.jpg" },
      { name: "Dan Moore", role: "Defender", image: "/src/assets/player-photos/dan-moore.jpg" },
    ],
    stats: { wins: 1, goals: 5 },
  },
  {
    id: 12,
    name: "Digital Stars",
    image: "/src/assets/team-logos/Кефтеме.png", // локальный путь
    color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Steve Clark", role: "Captain", image: "/src/assets/player-photos/steve-clark.jpg" },
      { name: "Mark Lewis", role: "Midfielder", image: "/src/assets/player-photos/mark-lewis.jpg" },
      { name: "Dan Moore", role: "Defender", image: "/src/assets/player-photos/dan-moore.jpg" },
    ],
    stats: { wins: 1, goals: 5 },
  },
];

const Teams = () => {
  return (
    <section id="teams" className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold tracking-wider uppercase text-sm">
              Participants
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            COMPETING <span className="text-gradient">TEAMS</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Meet the media organizations battling for e-football supremacy.
          </p>
        </div>

        {/* Teams Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team) => (
            <div
              key={team.id}
              className="esports-card p-6 card-hover group"
            >
              {/* Team Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${team.color} flex items-center justify-center shadow-lg overflow-hidden`}>
                  {team.image ? (
                    <img 
                      src={team.image} 
                      alt={team.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-xl text-white">
                      {team.name.substring(0, 3).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">
                    {team.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Trophy size={14} className="text-accent" />
                      <span>{team.stats.wins} Wins</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Target size={14} className="text-primary" />
                      <span>{team.stats.goals} Goals</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Players */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Key Players
                </h4>
                {team.players.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-10 h-10 rounded-lg object-cover border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {player.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{player.role}</p>
                    </div>
                    {player.role === "Captain" && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-primary/20 text-primary rounded uppercase">
                        C
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* View Team Button */}
              <button className="w-full mt-6 py-3 border border-border rounded-lg text-muted-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-colors uppercase tracking-wider">
                View Full Roster
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Teams;