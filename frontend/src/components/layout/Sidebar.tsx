export function Sidebar() {
  return (
    <aside className="bg-surface h-screen w-64 fixed left-0 top-0 border-r border-outline-variant flex flex-col py-lg px-md z-50">
        <div className="mb-xl">
            <h1 className="font-headline-md text-headline-md font-bold text-primary">AI Smart Settlement</h1>
            <p className="text-on-surface-variant font-label-md text-label-md">ZRG Internal Version</p>
        </div>
        
        <nav className="flex-1 space-y-xs">
            <a className="flex items-center gap-sm p-sm rounded-lg text-primary font-bold border-r-2 border-primary hover:bg-surface-container-low transition-colors" href="#">
                <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                <span className="font-body-md text-body-md">Dashboard</span>
            </a>
            <a className="flex items-center gap-sm p-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors" href="#">
                <span className="material-symbols-outlined" data-icon="payments">payments</span>
                <span className="font-body-md text-body-md">Settlements</span>
            </a>
            <a className="flex items-center gap-sm p-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors" href="#">
                <span className="material-symbols-outlined" data-icon="settings_input_component">settings_input_component</span>
                <span className="font-body-md text-body-md">Configurations</span>
            </a>
            <a className="flex items-center gap-sm p-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors" href="#">
                <span className="material-symbols-outlined" data-icon="analytics">analytics</span>
                <span className="font-body-md text-body-md">Reports</span>
            </a>
            <a className="flex items-center gap-sm p-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors" href="#">
                <span className="material-symbols-outlined" data-icon="settings">settings</span>
                <span className="font-body-md text-body-md">Settings</span>
            </a>
        </nav>

        <div className="mt-auto pt-lg border-t border-outline-variant space-y-xs">
            <button className="w-full bg-primary text-on-primary py-sm rounded-xl font-label-md text-label-md mb-md active:scale-[0.98] transition-transform">
                New Settlement
            </button>
            <a className="flex items-center gap-sm p-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors" href="#">
                <span className="material-symbols-outlined" data-icon="help">help</span>
                <span className="font-body-md text-body-md">Support</span>
            </a>
            <a className="flex items-center gap-sm p-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors" href="#">
                <span className="material-symbols-outlined" data-icon="logout">logout</span>
                <span className="font-body-md text-body-md">Sign Out</span>
            </a>
        </div>
    </aside>
  );
}
