import Image from "next/image";
import Link from "next/link";
import { BackArrowIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/site";

export function AccountPublicHeader() {
  return (
    <header className="account-public-header">
      <div className="account-container account-public-header__inner">
        <Link className="account-brand" href={routes.home} aria-label="Nibrexo home">
          <Image src="/assets/nibrexo-primary-header.png" alt="Nibrexo" width={148} height={40} priority />
        </Link>
        <Link className="account-return" href={routes.home}>
          <BackArrowIcon />
          Back to Nibrexo
        </Link>
      </div>
    </header>
  );
}
