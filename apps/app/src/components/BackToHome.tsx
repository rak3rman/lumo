import { Button } from "@app/components/ui/button";
import Link from "next/link";

export function BackToHome() {
  return (
    <div className="text-center mt-8">
      <Button
        variant="ghost"
        asChild
        className="text-gray-600 hover:text-gray-800"
      >
        <Link href="/">← Start Over</Link>
      </Button>
    </div>
  );
}
