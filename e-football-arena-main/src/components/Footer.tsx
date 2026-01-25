import { motion } from "framer-motion";
import { Gamepad2, Youtube, Twitter, Instagram, Twitch } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container px-4 relative z-10">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <a href="#" className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-10 h-10 text-secondary" />
              <div>
                <span className="font-heading font-extrabold text-xl block">
                  E Football <span className="text-secondary">Media League</span>
                </span>
                <span className="text-xs text-muted-foreground">PlayStation Tournament</span>
              </div>
            </a>
            <p className="text-sm text-muted-foreground max-w-xs">
              Крупнейший соревновательный турнир по киберфутболу, объединяющий лучших игроков со всего мира.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Schedule", "Standings", "Live Matches", "Teams", "Partners"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(" ", "-")}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-4">Follow Us</h4>
            <div className="flex gap-4">
              {[
                { icon: Youtube, href: "https://www.youtube.com/@mediafootballtj", label: "YouTube" },
                // { icon: Twitch, href: "#", label: "Twitch" },
                // { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Instagram, href: "https://www.instagram.com/mediafootballtj?igsh=MTYxZjcxM3lyaW55dg==", label: "Instagram" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 E Football Media League. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
