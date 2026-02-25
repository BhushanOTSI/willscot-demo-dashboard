import { Logo } from "./Logo";

export function Header() {
    return (
        <header className="border-b bg-background">
            <div className="container mx-auto px-4 py-4 ">
                <Logo />
            </div>
        </header>
    );
}

