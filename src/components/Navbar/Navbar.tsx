import { Logo } from ".";
import { UserChips } from ".";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-dark-500 px-5 py-4">
      <Logo />
      <UserChips />
    </nav>
  );
}
