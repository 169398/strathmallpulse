import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "../ui/button";
import UserButton from "./header/user-button";
import MobileNav from "./MobileNav";
import SearchBar from "./searchBar";
import { auth } from "@/auth";

export default async function Navbar() {
  const session = await auth();

  return (
     <div className='fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-[10] py-2'>
      <div className='container max-w-7xl h-full mx-auto flex items-center justify-between gap-2'>
              <div className="flex items-center lg:ml-4">
                <Link href="/">
                  <Image
                    src="/logo.png"
                    alt="strathmall logo"
                    width={100}
                    height={100}
                    className="h-24 w-24 lg:h-30 lg:w-30"
                  />
                </Link>
              </div>
              <div className="hidden lg:flex lg:flex-1 lg:ml-8 lg:space-x-8 items-center">
                <div className="flex-1 max-w-md">
        <SearchBar />
                </div>
              </div>
              <div className="hidden lg:flex lg:items-center lg:space-x-6">
                <div className="flex items-center space-x-4">
                  {session ? (
                    <div className="h-12 w-12 flex items-center justify-center">
                      <UserButton />
                    </div>
                  ) : (
                    <>
                      <Link
                        href="/sign-in"
                        className={buttonVariants({
                          variant: "secondary",
                          className: "text-sm",
                        })}
                      >
                        Log in
                        </Link>
                        
                      <span
                        className="h-6 w-px bg-gray-200"
                        aria-hidden="true"
                      />
                      <Link
                        href="/sign-up"
                        className={buttonVariants({
                          variant: "default",
                          className: "text-sm",
                        })}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                 
                </div>
              </div>
            <MobileNav />
          </div>
    </div>
  );
}