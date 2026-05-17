export function Header() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-surface flex justify-between items-center px-gutter border-b border-outline-variant z-40">
        <div className="flex items-center gap-lg">
            <span className="font-headline-md text-headline-md font-black text-on-surface">AI Smart Settlement</span>
            <nav className="hidden md:flex gap-md">
                <a className="text-primary border-b-2 border-primary pb-1 font-label-md text-label-md" href="#">Direct Settlement</a>
                <a className="text-on-surface-variant hover:text-primary transition-opacity font-label-md text-label-md" href="#">Bulk Upload</a>
            </nav>
        </div>
        
        <div className="flex items-center gap-md">
            <div className="relative hidden lg:block">
                <input className="bg-surface-container-low border border-outline-variant rounded-xl px-md py-xs text-body-sm w-64 focus:ring-2 focus:ring-primary/10 outline-none" placeholder="Search transactions..." type="text"/>
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-opacity">
                <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
            </button>
            <div className="flex items-center gap-sm ml-sm cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-highest">
                    <img alt="User Profile" src="https://openui.fly.dev/openui/80x80.svg?text=👤"/>
                </div>
            </div>
        </div>
    </header>
  );
}
