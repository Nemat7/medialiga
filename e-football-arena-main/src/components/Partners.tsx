import { motion } from "framer-motion";
import { Handshake } from "lucide-react";

const partners = [
  {
    name: "1xBet",
    logo: "/static/efootball/assets/partners/1x.png", // Путь к логотипу
    // description: "Официальный партнер лиги"
  },
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
            Наш <span className="text-secondary">Партнер</span>
          </h2>
        </motion.div>

        <div className="flex justify-center mt-12">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative group cursor-pointer"
            >
              {/* Основной блок партнера */}
              <div className="card-esports p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform duration-300 max-w-md w-full">
                {/* Логотип - изображение */}
                <div className="relative w-48 h-24 flex items-center justify-center">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-full h-full object-contain filter brightness-100 contrast-100 group-hover:brightness-110 group-hover:contrast-110 transition-all duration-300"
                  />

                  {/* Декоративные элементы */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-500 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Название */}
                <span className="font-heading font-bold text-2xl text-center text-foreground group-hover:text-green-400 transition-colors">
                  {partner.name}
                </span>

                {/* Описание */}
                <span className="text-center text-muted-foreground group-hover:text-foreground transition-colors">
                  {partner.description}
                </span>

                {/* Индикатор официального партнера */}
                {/* <div className="mt-4 px-4 py-2 bg-green-900/30 border border-green-700/50 rounded-full">
                  <span className="text-sm font-semibold text-green-400">Официальный партнер</span>
                </div> */}
              </div>

              {/* Эффект свечения при наведении */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div>
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
          {/* <p className="text-muted-foreground mb-4">Хотите стать нашим партнером?</p> */}
          <a href="#contact" className="btn-esports inline-flex">
            Стать партнером
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Partners;