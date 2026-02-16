import { Link } from "react-router-dom";
import { FOOTER_SECTIONS } from "@/constants";
import { SOCIAL_ICON_MAP } from "@/utils/icons";

export default function Footer() {
  return (
    <footer className="py-16 border-t border-border-subtle">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-center gap-16 md:gap-24">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-text-secondary font-medium mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => {
                  const Icon = SOCIAL_ICON_MAP[link.label.toLowerCase()];

                  if (link.external && link.href) {
                    return (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-default text-sm"
                        >
                          {Icon && <Icon className="w-4 h-4" />}
                          {link.label}
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={link.label}>
                      <Link
                        to={link.to || "/"}
                        className="text-text-muted hover:text-text-primary transition-default text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border-subtle text-center">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} SoundScout
          </p>
        </div>
      </div>
    </footer>
  );
}
