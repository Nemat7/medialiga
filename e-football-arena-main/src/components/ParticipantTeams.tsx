import { motion } from "framer-motion";
import { Users, Crown, Gamepad } from "lucide-react";

interface Player {
  name: string;
  role: string;
}

interface Team {
  id: number;
  name: string;
  tag: string;
  color: string;
  players: Player[];
}

const teamsData: Team[] = [
  {
    id: 1,
    name: "Thunder FC",
    tag: "THU",
    color: "#FEFE00",
    players: [
      { name: "Alex Storm", role: "Captain" },
      { name: "Marcus Wave", role: "Striker" },
      { name: "Jake Thunder", role: "Midfielder" },
      { name: "Ryan Bolt", role: "Defender" },
      { name: "Sam Shield", role: "Goalkeeper" },
    ],
  },
  {
    id: 2,
    name: "Digital Lions",
    tag: "DGL",
    color: "#EB5186",
    players: [
      { name: "Leo Byte", role: "Captain" },
      { name: "Ryan Code", role: "Striker" },
      { name: "Tom Data", role: "Midfielder" },
      { name: "Chris Server", role: "Defender" },
      { name: "Dan Keeper", role: "Goalkeeper" },
    ],
  },
  {
    id: 3,
    name: "Cyber Eagles",
    tag: "CYE",
    color: "#00FFFF",
    players: [
      { name: "Jake Pixel", role: "Captain" },
      { name: "Tom Circuit", role: "Striker" },
      { name: "Mike Binary", role: "Midfielder" },
      { name: "Luke Firewall", role: "Defender" },
      { name: "Ben Net", role: "Goalkeeper" },
    ],
  },
  {
    id: 4,
    name: "Neon Strikers",
    tag: "NEO",
    color: "#00FF00",
    players: [
      { name: "Sam Glow", role: "Captain" },
      { name: "Chris Flash", role: "Striker" },
      { name: "Nick Laser", role: "Midfielder" },
      { name: "Josh Volt", role: "Defender" },
      { name: "Matt Guard", role: "Goalkeeper" },
    ],
  },
  {
    id: 5,
    name: "Pixel Warriors",
    tag: "PIX",
    color: "#FF6B00",
    players: [
      { name: "Mike Vector", role: "Captain" },
      { name: "Dan Sprite", role: "Striker" },
      { name: "Alex Frame", role: "Midfielder" },
      { name: "Ryan Render", role: "Defender" },
      { name: "Tom Save", role: "Goalkeeper" },
    ],
  },
  {
    id: 6,
    name: "Storm United",
    tag: "STU",
    color: "#8B5CF6",
    players: [
      { name: "Ben Thunder", role: "Captain" },
      { name: "Luke Rain", role: "Striker" },
      { name: "Jack Cloud", role: "Midfielder" },
      { name: "Max Wind", role: "Defender" },
      { name: "Leo Storm", role: "Goalkeeper" },
    ],
  },
  {
    id: 7,
    name: "Blaze FC",
    tag: "BLZ",
    color: "#FF4444",
    players: [
      { name: "Nick Fire", role: "Captain" },
      { name: "Josh Ember", role: "Striker" },
      { name: "Sam Flame", role: "Midfielder" },
      { name: "Chris Burn", role: "Defender" },
      { name: "Ryan Ash", role: "Goalkeeper" },
    ],
  },
  {
    id: 8,
    name: "Shadow Wolves",
    tag: "SHW",
    color: "#888888",
    players: [
      { name: "Matt Night", role: "Captain" },
      { name: "Eric Dark", role: "Striker" },
      { name: "Tom Shade", role: "Midfielder" },
      { name: "Jake Moon", role: "Defender" },
      { name: "Dan Shadow", role: "Goalkeeper" },
    ],
  },
  {
    id: 9,
    name: "Volt Gaming",
    tag: "VLT",
    color: "#FFD700",
    players: [
      { name: "Zack Spark", role: "Captain" },
      { name: "Kyle Charge", role: "Striker" },
      { name: "Drew Amp", role: "Midfielder" },
      { name: "Cole Watt", role: "Defender" },
      { name: "Ian Power", role: "Goalkeeper" },
    ],
  },
  {
    id: 10,
    name: "Apex United",
    tag: "APX",
    color: "#FF1493",
    players: [
      { name: "Finn Peak", role: "Captain" },
      { name: "Owen Summit", role: "Striker" },
      { name: "Evan Height", role: "Midfielder" },
      { name: "Blake Top", role: "Defender" },
      { name: "Dean Rise", role: "Goalkeeper" },
    ],
  },
  {
    id: 11,
    name: "Nova Esports",
    tag: "NOV",
    color: "#9370DB",
    players: [
      { name: "Theo Star", role: "Captain" },
      { name: "Liam Cosmic", role: "Striker" },
      { name: "Noah Orbit", role: "Midfielder" },
      { name: "Eli Galaxy", role: "Defender" },
      { name: "Jace Nebula", role: "Goalkeeper" },
    ],
  },
  {
    id: 12,
    name: "Fury FC",
    tag: "FRY",
    color: "#DC143C",
    players: [
      { name: "Axel Rage", role: "Captain" },
      { name: "Rex Havoc", role: "Striker" },
      { name: "Wade Chaos", role: "Midfielder" },
      { name: "Troy Mayhem", role: "Defender" },
      { name: "Brock Fury", role: "Goalkeeper" },
    ],
  },
];

const ParticipantTeams = () => {
  return (
    <section id="teams" className="py-20 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title gradient-border pb-4">
            <Users className="inline-block w-10 h-10 mr-3 text-secondary" />
            Participating <span className="text-secondary">Teams</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {teamsData.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="card-esports overflow-hidden group hover:scale-105 transition-transform duration-300"
            >
              {/* Team header with accent color */}
              <div 
                className="h-2"
                style={{ background: `linear-gradient(90deg, ${team.color}, transparent)` }}
              />
              
              <div className="p-6">
                {/* Team tag */}
                <div className="flex items-center justify-between mb-4">
                  <span 
                    className="text-xs font-bold px-2 py-1 rounded"
                    style={{ backgroundColor: `${team.color}20`, color: team.color }}
                  >
                    {team.tag}
                  </span>
                  <Gamepad className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                </div>
                
                {/* Team name */}
                <h3 className="font-heading font-extrabold text-xl mb-4 group-hover:text-primary transition-colors">
                  {team.name}
                </h3>
                
                {/* Players */}
                <div className="space-y-3">
                  {team.players.map((player, pIndex) => (
                    <div key={pIndex} className="flex items-center gap-3">
                      {/* Player avatar placeholder */}
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{ 
                          backgroundColor: `${team.color}30`,
                          color: team.color 
                        }}
                      >
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-1">
                          {player.name}
                          {player.role === "Captain" && (
                            <Crown className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{player.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ParticipantTeams;
