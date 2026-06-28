import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const footerSections = [
  {
    id: "help",
    title: "Помощь",
    links: [
      { label: "Мой аккаунт", href: "/member" },
      { label: "Магазины", href: "/" },
      { label: "Обмен и возврат", href: "/returns" },
      { label: "Контакты", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    id: "about",
    title: "О нас",
    links: [{ label: "Компания", href: "/information" }],
  },
  {
    id: "company",
    title: "Группа компаний",
    links: [{ label: "BishWay", href: "https://bishway.com/" }],
  },
  {
    id: "legal",
    links: [
      { label: "Политика конфиденциальности", href: "/privacy" },
      { label: "Условия использования", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-gray-100 mt-4 pt-6">
      <div className="container mx-auto px-4 sm:px-10">
        {/* Link sections */}
        <div className="flex flex-col pb-4">
          {footerSections.map((section) => (
            <div key={section.id}>
              <h3 className="text-[13px] text-gray-500 my-3">
                {section.title}
              </h3>
              <ul className="flex flex-col sm:flex-row sm:divide-x divide-foreground font-medium">
                {section.links.map((link) => (
                  <li key={link.label} className="sm:first:pl-0 sm:px-3">
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />

        {/* Bottom bar */}
        <div className="flex justify-between items-center">
          <p className="py-4 text-gray-500 text-[13px]">
            © 2026 UNIQLO KG. Все права защищены.
          </p>
          <div className="flex text-xs">Тут будут соцсети</div>
        </div>
      </div>
    </footer>
  );
}
