import { Users, Trophy, Target } from "lucide-react";

const teams = [
  {
    id: 1,
    name: "FC Kalapocha",
    image: "/static/efootball/assets/team-logos/Калапоча.png", // локальный путь
//     color: "from-red-500 to-red-700",
    players: [
      { name: "Шарифчон Сатторзода", role: "Captain", image: "/static/efootball/assets/player-photos/alex-johnson.jpg" },
      { name: "Асроров Сомон", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 7.png" },
      { name: "Беков Аюб", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 14.png" },
      { name: "Сайфуллозода Зафар", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 16.png" },
    ],
    stats: { wins: 0, goals: 1 },
  },
  {
    id: 2,
    name: "FC CRIF",
    image: "/static/efootball/assets/team-logos/Криф.png", // локальный путь
//     color: "from-blue-500 to-blue-700",
    players: [
      { name: "Хошимов Алишер", role: "Captain", image: "/static/efootball/assets/player-photos/Frame 15.png" },
      { name: "Исматзода Некруз", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 13.png" },
      { name: "Абдусамадзода Манучер", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 12.png" },
      { name: "Дильшод Садиков", role: "Игрок", image: "/static/efootball/assets/player-photos/chris-taylor.jpg" },
      { name: "Далер Азимзода", role: "Игрок", image: "/static/efootball/assets/player-photos/chris-taylor.jpg" },
    ],
    stats: { wins: 1, goals: 6 },
  },
  {
    id: 3,
    name: "FC Menchos",
    image: "/static/efootball/assets/team-logos/Менчос.png", // локальный путь
//     color: "from-purple-500 to-purple-700",
    players: [
      { name: "Джалилов Бахром", role: "Captain", image: "/static/efootball/assets/player-photos/ryan-garcia.jpg" },
      { name: "Абдуалимов Бехруз", role: "Игрок", image: "/static/efootball/assets/player-photos/kevin-lee.jpg" },
      { name: "Саидов Самир", role: "Игрок", image: "/static/efootball/assets/player-photos/brian-white.jpg" },
      { name: "Субхон Халимов", role: "Игрок", image: "/static/efootball/assets/player-photos/brian-white.jpg" },
      { name: "Манучер Мухторов", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 1 (1).png" },
    ],
    stats: { wins: 0, goals: 1 },
  },
  {
    id: 4,
    name: "Persians",
    image: "/static/efootball/assets/team-logos/Персы.png", // локальный путь
//     color: "from-green-500 to-green-700",
    players: [
      { name: "Беназирзода Шерзод", role: "Captain", image: "/static/efootball/assets/player-photos/sam-miller.jpg" },
      { name: "Беназирзода Манучер", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 18.png" },
      { name: "Орипов Сино", role: "Менеджер", image: "/static/efootball/assets/player-photos/Frame 17.png" },
    ],
    stats: { wins: 0, goals: 1 },
  },
  {
    id: 5,
    name: "The Poizd CF",
    image: "/static/efootball/assets/team-logos/Поизд.png", // локальный путь
//     color: "from-orange-500 to-orange-700",
    players: [
      { name: "Розиков Шерзод", role: "Менеджер", image: "/static/efootball/assets/player-photos/Frame 22.png" },
      { name: "Мирзоев Джахонгир", role: "Тренер", image: "/static/efootball/assets/player-photos/eric-jones.jpg" },
      { name: "Фозилов Аминчон", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 21.png" },
    ],
    stats: { wins: 1, goals: 4 },
  },
  {
    id: 6,
    name: "FC Sebiston",
    image: "/static/efootball/assets/team-logos/Себистон.png", // локальный путь
//     color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Курбонов Фарход", role: "Менеджер", image: "/static/efootball/assets/player-photos/Frame 19.png" },
      { name: "Саидов Хамод", role: "Игрок", image: "/static/efootball/assets/player-photos/mark-lewis.jpg" },
      { name: "Шарифов Исомиддин", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 20.png" },
      { name: "Шарапов Азиз", role: "Игрок", image: "/static/efootball/assets/player-photos/steve-clark.jpg" },
      { name: "Шарипов Манучер ", role: "Игрок", image: "/static/efootball/assets/player-photos/steve-clark.jpg" },
    ],
    stats: { wins: 0, goals: 3 },
  },
  {
    id: 7,
    name: "FC Smuzi",
    image: "/static/efootball/assets/team-logos/смузи.png", // локальный путь
//     color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Аскаров Аскар", role: "Игрок", image: "/static/efootball/assets/player-photos/steve-clark.jpg" },
      { name: "Фируз Карачаев", role: "Игрок", image: "/static/efootball/assets/player-photos/mark-lewis.jpg" },
      { name: "Ардашер Исаев", role: "Тренер", image: "/static/efootball/assets/player-photos/dan-moore.jpg" },
      { name: "Низор Мамеджанов", role: "Игрок", image: "/static/efootball/assets/player-photos/dan-moore.jpg" },
    ],
    stats: { wins: 0, goals: 1 },
  },
  {
    id: 8,
    name: "MFC Somonion",
    image: "/static/efootball/assets/team-logos/Сомони.png", // локальный путь
//     color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Латипов Карим", role: "Менеджер", image: "/static/efootball/assets/player-photos/steve-clark.jpg" },
      { name: "Хусейнов Шахбоз", role: "Тренер", image: "/static/efootball/assets/player-photos/mark-lewis.jpg" },
      { name: "Файзуллоев Сорбон", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 6.png" },
      { name: "Халимов Хуршед", role: "Игрок", image: "/static/efootball/assets/player-photos/steve-clark.jpg" },
      { name: "Одинаев Зиедулло", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 5.png" },
    ],
    stats: { wins: 1, goals: 5 },
  },
  {
    id: 9,
    name: "Favik",
    image: "/static/efootball/assets/team-logos/Фавик.png", // локальный путь
//     color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Фаридун Сафаров", role: "Менеджер", image: "/static/efootball/assets/player-photos/Frame 23.png" },
      { name: "Далери Сафарали", role: "Игрок", image: "/static/efootball/assets/player-photos/mark-lewis.jpg" },
      { name: "Гадоев Алишер", role: "Игрок", image: "/static/efootball/assets/player-photos/dan-moore.jpg" },
      { name: "Гадоев Манучер", role: "Игрок", image: "/static/efootball/assets/player-photos/steve-clark.jpg" },
      { name: "Бобочони Холмурод", role: "Тренер", image: "/static/efootball/assets/player-photos/steve-clark.jpg" },
    ],
    stats: { wins: 0, goals: 2 },
  },
  {
    id: 10,
    name: "FC Xamako",
    image: "/static/efootball/assets/team-logos/хамако 4.png", // локальный путь
//     color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Боваров Шерзод", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 4.png" },
      { name: "Нематов Фаридун", role: "Игрок", image: "/static/efootball/assets/player-photos/mark-lewis.jpg" },
      { name: "Мирзоев Рамазон", role: "Менеджер", image: "/static/efootball/assets/player-photos/dan-moore.jpg" },
      { name: "Хакимов Шухратджон", role: "Тренер", image: "/static/efootball/assets/player-photos/steve-clark.jpg" },
      { name: "Хайдаров Дильшод", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 2.png" },
    ],
    stats: { wins: 1, goals: 8 },
  },
  {
    id: 11,
    name: "FFT",
    image: "/static/efootball/assets/team-logos/fft_logo 1.png", // локальный путь
//     color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Сухроб Джалилов", role: "Менеджер", image: "/static/efootball/assets/player-photos/Frame 11.png" },
      { name: "Мехрубон Каримов", role: "Игрок", image: "/static/efootball/assets/player-photos/mark-lewis.jpg" },
      { name: "Салохиддин Иргашев", role: "Игрок", image: "/static/efootball/assets/player-photos/dan-moore.jpg" },
      { name: "Мухаммад", role: "Игрок", image: "/static/efootball/assets/player-photos/steve-clark.jpg" },
      { name: "Шериддин Бобоев ", role: "Тренер", image: "/static/efootball/assets/player-photos/Frame 24.png" },
    ],
    stats: { wins: 1, goals: 3 },
  },
  {
    id: 12,
    name: "Kefteme FC",
    image: "/static/efootball/assets/team-logos/Кефтеме.png", // локальный путь
//     color: "from-cyan-500 to-cyan-700",
    players: [
      { name: "Махмадалиев Фаррух", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 8.png" },
      { name: "Мухаммад Рахмонов", role: "Игрок", image: "/static/efootball/assets/player-photos/Frame 9 (1).png" },
      { name: "Курбанов Ибра", role: "Менеджер", image: "/static/efootball/assets/player-photos/dan-moore.jpg" },
      { name: "Сухайли Эльчибеков", role: "Тренер", image: "/static/efootball/assets/player-photos/Frame 10 (1).png" },
    ],
    stats: { wins: 0, goals: 3 },
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
              Участники
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            КОМАНДЫ <span className="text-gradient">СОПЕРНИКИ</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Познакомьтесь с медиа-командами, борющимися за первенство в киберфутболе.
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
                      <span>{team.stats.wins} Победы</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Target size={14} className="text-primary" />
                      <span>{team.stats.goals} Голы</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Players */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ключевые игроки
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

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Teams;