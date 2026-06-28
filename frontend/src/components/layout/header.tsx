import { HeaderLogo } from "./header/logo";
import { NavbarDesktop, NavbarMobile, type TabId } from "./header/navbar";
import { SearchButton } from "./header/search";
import { ProfileButtons } from "./header/profile";
import { CartButton } from "./header/cart";
import { MobileMenu } from "./header/mobile-menu";

interface HeaderProps {
  activeTab: TabId | null;
}

export function Header({ activeTab }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full text-white bg-linear-to-b from-black/30 to-transparent text-shadow-md">
      {/* Main row */}
      <div className="container mx-auto px-1 h-14 lg:h-16 flex items-center gap-2 text-shadow-current">
        <HeaderLogo />
        <NavbarDesktop activeTab={activeTab} />

        <nav className="flex items-center ml-auto">
          <SearchButton />

          <ProfileButtons />
          <CartButton />
          <MobileMenu activeTab={activeTab} />
        </nav>
      </div>

      {/* Mobile navbar — 44px */}
      <NavbarMobile activeTab={activeTab} />
    </header>
  );
}
