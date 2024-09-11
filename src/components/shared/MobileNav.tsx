import Link from "next/link";
import Image from "next/image";
import UserButton from "./header/user-button";
import { buttonVariants } from "../ui/button";
import { auth } from "@/auth";

export default async function MobileNav() {
  const session = await auth(); // Fetch session server-side

  return (
    <div className="lg:hidden fixed inset-x-0 top-0 z-50 bg-white shadow-md">
      <div className="flex flex-col items-center border-b border-gray-200 p-4">
        <div className="flex items-center justify-between w-full">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="strathmall logo"
              width={150} // Larger logo
              height={150}
              className="h-20 w-20" // Adjusted size for a bigger appearance
            />
          </Link>
          <div className="flex items-center space-x-2">
            {session ? (
              <div className="h-8 w-8 flex items-center justify-center">
                {" "}
                {/* Smaller buttons */}
                <UserButton />
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={buttonVariants({
                    variant: "secondary",
                    className: "text-xs", // Smaller text for links
                  })}
                >
                  Log in
                </Link>
                <span className="h-4 w-px bg-gray-200" aria-hidden="true" />
                <Link
                  href="/sign-up"
                  className={buttonVariants({
                    variant: "default",
                    className: "text-xs",
                  })}
                >
                  Sign up
                </Link>
              </>
            )}
            
          </div>
        </div>
       
      </div>
    </div>
  );
}
