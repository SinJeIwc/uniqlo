import Link from "next/link";

const footerSections = [
  {
    title: "Помощь",
    links: [
      { label: "Мой аккаунт", href: "/account" },
      { label: "Магазины", href: "/stores" },
      { label: "Обмен и возврат", href: "/returns" },
      { label: "Подарочная карта", href: "/gift-card" },
      { label: "Контакты и FAQ", href: "/contact" },
    ],
  },
  {
    title: "О нас",
    links: [
      { label: "Компания", href: "/about" },
      { label: "Устойчивое развитие", href: "/sustainability" },
      { label: "Карьера", href: "/careers" },
      { label: "Приложение UNIQLO", href: "/app" },
    ],
  },
  {
    title: "Группа компаний",
    links: [
      { label: "GU", href: "#" },
      { label: "Theory", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
        {/* Promo bar */}
        <div className="text-center text-sm text-zinc-600 mb-10 pb-8 border-b border-zinc-100">
          <p>Бесплатная доставка от 5 000 KGS | Бесплатный самовывоз из магазина</p>
        </div>

        {/* Link sections */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
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

        {/* Bottom bar */}
        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-zinc-900 transition-colors">
              Условия использования
            </Link>
            <Link href="/privacy" className="hover:text-zinc-900 transition-colors">
              Конфиденциальность
            </Link>
            <Link href="/accessibility" className="hover:text-zinc-900 transition-colors">
              Доступность
            </Link>
          </div>
          <p>© 2026 UNIQLO KG. Все права защищены.</p>
          <div className="flex gap-3 text-zinc-400">
            <span>🇰🇬 Кыргызстан</span>
            <span className="font-medium text-zinc-600">Русский</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
