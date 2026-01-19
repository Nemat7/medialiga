import { motion } from "framer-motion";
import { Handshake } from "lucide-react";

const partners = [
  { name: "PlayStation", logo: "🎮" },
  { name: "EA Sports", logo: "⚽" },
  { name: "Red Bull", logo: "🔴" },
  { name: "Razer", logo: "🐍" },
  { name: "Logitech", logo: "🎯" },
  { name: "NVIDIA", logo: "💚" },
  { name: "Twitch", logo: "💜" },
  { name: "Discord", logo: "💬" },
];

const Partners = () => {
  return (
    <section id="partners" className="py-20 relative">
      <div 
        className="absolute inset-0 opacity-20"
        style={{ background: 'linear-gradient(180deg, transparent 0%, hsl(240, 100%, 20%) 50%, transparent 100%)' }}
      />
      
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title gradient-border pb-4">
            <Handshake className="inline-block w-10 h-10 mr-3 text-secondary" />
            Our <span className="text-secondary">Partners</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="card-esports p-6 flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform cursor-pointer group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">{partner.logo}</span>
              <span className="font-heading font-bold text-center text-muted-foreground group-hover:text-foreground transition-colors">
                {partner.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Become a partner CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">Interested in partnering with us?</p>
          <a href="#contact" className="btn-esports inline-flex">
            Become a Partner
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Partners;
