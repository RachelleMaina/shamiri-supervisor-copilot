import { Bell } from "lucide-react";

export default function Navbar({user}:{user:any}) {
  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="/" className="flex items-center">
            <img
              src="https://cdn.prod.website-files.com/69117576ff647ba59211038a/691c1682c21941c34ac32501_One%20Shamiri%20Wordmark%20-%20Color%20Version-p-2000.png"
              alt="Shamiri Institute Wordmark"
              className="h-8 w-auto object-contain"
            />
          </a>

          {/* Right Section */}
          <div className="flex items-center gap-6">

            {/* Notifications */}
            <button
              className="relative p-2 rounded-full text-primary hover:bg-slate-100 transition"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
            </button>

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-primary">
                 {user?.name}
                </div>
                <div className="text-xs text-slate-500">
                  Supervisor
                </div>
              </div>

              <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-primary font-medium text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
