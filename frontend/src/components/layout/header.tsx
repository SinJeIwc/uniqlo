import { cn } from "@/lib/utils";
import { HeaderLogo } from "./header/logo";
import { NavbarDesktop, NavbarMobile, type TabId } from "./header/navbar";
import { SearchButton } from "./header/search";
import { ProfileButtons } from "./header/profile";
import { CartButton } from "./header/cart";
import { MobileMenu } from "./header/mobile-menu";

interface HeaderProps {
  activeTab: TabId | null;
  isHome: boolean;
}

export function Header({ activeTab, isHome }: HeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full text-white drop-shadow-md",
      )}
    >
      {/* Main row */}
      <div className="container mx-auto px-3 h-14 lg:h-16 flex items-center gap-0">
        <HeaderLogo />
        <NavbarDesktop activeTab={activeTab} isHome={isHome} />
        <div className="flex-1" />

        <div className="flex items-center gap-0">
          <SearchButton isHome={isHome} />
          <ProfileButtons isHome={isHome} />
          <CartButton isHome={isHome} />
          <MobileMenu isHome={isHome} activeTab={activeTab} />
        </div>
      </div>

      {/* Mobile navbar — 44px */}
      <NavbarMobile activeTab={activeTab} isHome={isHome} />
    </header>
  );
}
