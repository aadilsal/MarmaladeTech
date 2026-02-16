export default function Footer(){
  return (
    <footer className="bg-slate-800 text-slate-200 py-8">
      <div className="container mx-auto px-6 max-w-5xl flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <div className="font-bold text-lg">Marmalade Tech</div>
          <div className="text-sm text-slate-400">© {new Date().getFullYear()} Marmalade Tech — All rights reserved</div>
        </div>
        <div className="flex gap-4">
          <a className="text-slate-300 hover:text-white text-sm" href="/terms">Terms</a>
          <a className="text-slate-300 hover:text-white text-sm" href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  )
}
