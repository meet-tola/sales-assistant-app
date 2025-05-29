import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="bg-white shadow-sm text-gray-800 flex justify-between p-5 sticky z-50 top-0">
      <Link href="/" className="flex text-4xl items-center font-thin">
        <div className="space-y-1 ">
          <div className="font-semibold text-xl">Myhelper</div>
        </div>
      </Link>
      <div className="flex items-center hover:cursor-pointer">
        <SignedOut>
          <SignInButton>
            <Button className="bg-black">Sign In</Button>
          </SignInButton>
          <SignUpButton>
            <Button className="bg-black ml-2">Sign Up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton showName />
        </SignedIn>
      </div>
    </header>
  );
};

export default Header;
