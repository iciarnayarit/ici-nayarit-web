'use client';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <span className="font-display font-bold text-xl text-gray-900 tracking-wide block mb-4">ICIAR <span className="text-[#B88A44]">Nayarit</span></span>
                    <p className="text-gray-500 text-sm">Llevando el mensaje de salvación a todo México y las naciones.</p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-4">Explorar</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li><Link className="hover:text-[#B88A44]" href="/biblia">Biblia</Link></li>
                        <li><Link className="hover:text-[#B88A44]" href="/planes">Planes</Link></li>
                        <li><Link className="hover:text-[#B88A44]" href="/templos">Templos</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-4">Comunidad</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li><Link className="hover:text-[#B88A44]" href="/radio">Radio Online</Link></li>
                        <li><Link className="hover:text-[#B88A44]" href="#">Eventos</Link></li>
                        <li><Link className="hover:text-[#B88A44]" href="/#download">Descargar App</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-4">Síguenos</h4>
                    <div className="flex space-x-4">
                        <a href="https://www.facebook.com/ici.nayarit" target="_blank" className="text-gray-500 hover:text-[#B88A44]">
                            <span className="sr-only">Facebook</span>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <a href="https://www.youtube.com/@iciarnayarit" target="_blank" className="text-gray-500 hover:text-[#B88A44]">
                            <span className="sr-only">YouTube</span>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M21.582,6.186c-0.23-0.834-0.9-1.495-1.748-1.722C18.25,4,12,4,12,4S5.75,4,4.166,4.464 c-0.848,0.227-1.518,0.888-1.748,1.722C2,7.77,2,12,2,12s0,4.23,0.418,5.814c0.23,0.834,0.9,1.495,1.748,1.722 C5.75,20,12,20,12,20s6.25,0,7.834-0.464c0.848-0.227,1.518-0.888,1.748-1.722C22,16.23,22,12,22,12S22,7.77,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-xs text-gray-400">© {year} ICIAR Nayarit. Todos los derechos reservados.</p>
                <div className="flex space-x-4 mt-4 md:mt-0">
                    <a className="text-xs text-gray-400 hover:text-[#B88A44]" href="#">Privacidad</a>
                    <a className="text-xs text-gray-400 hover:text-[#B88A44]" href="#">Términos</a>
                </div>
            </div>
        </div>
    </footer>
  );
}
