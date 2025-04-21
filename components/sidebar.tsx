import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask } from '@fortawesome/free-solid-svg-icons'
import {
  Home,
  Users,
  ShoppingCart,
  SmileIcon as Tooth,
  Stethoscope,
  FileText,
  Bed,
  PenToolIcon as Tool,
  Calendar,
  HelpCircle,
  FlaskRoundIcon as Flask,
} from "lucide-react";

export function Sidebar() {
  return (
    <nav className="w-64 bg-[#007bff] text-white p-5 h-screen">
      <h2 className="text-2xl font-bold mb-6">OTRASS</h2>
      <ul className="space-y-4">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-[#d1e7ff] transition-colors"
          >
            <Home className="mr-2" size={20} />
            <span>Inicio</span>
          </Link>
        </li>
        <li>
          <Link
            href="/personal"
            className="flex items-center hover:text-[#d1e7ff] transition-colors"
          >
            <Users className="mr-2" size={20} />
            <span>Gestión de Personal</span>
          </Link>
        </li>
        <li>
          <Link
            href="/laboratorio"
            className="flex items-center hover:text-[#d1e7ff] transition-colors"
          >
            <FontAwesomeIcon
              icon={faFlask}
              className="mr-2 w-4 h-4"
            />
            <span>Laboratorio</span>
          </Link>
        </li>
        <li>
          <Link
            href="/compras"
            className="flex items-center hover:text-[#d1e7ff] transition-colors"
          >
            <ShoppingCart className="mr-2" size={20} />
            <span>Compras</span>
          </Link>
        </li>
        <li>
          <Link
            href="/consultas-odontologicas"
            className="flex items-center hover:text-[#d1e7ff] transition-colors font-bold"
          >
            <Tooth className="mr-2" size={20} />
            <span>Consultas Odontológicas</span>
          </Link>
        </li>
        <li>
          <Link
            href="/consultas-medicas"
            className="flex items-center hover:text-[#d1e7ff] transition-colors"
          >
            <Stethoscope className="mr-2" size={20} />
            <span>Consultas Médicas</span>
          </Link>
        </li>
        <li>
          <Link
            href="/administracion"
            className="flex items-center hover:text-[#d1e7ff] transition-colors"
          >
            <FileText className="mr-2" size={20} />
            <span>Administración</span>
          </Link>
        </li>
        <li>
          <Link
            href="/hospitalizacion"
            className="flex items-center hover:text-[#d1e7ff] transition-colors"
          >
            <Bed className="mr-2" size={20} />
            <span>Hospitalización</span>
          </Link>
        </li>
        <li>
          <Link
            href="/mantenimiento"
            className="flex items-center hover:text-[#d1e7ff] transition-colors"
          >
            <Tool className="mr-2" size={20} />
            <span>Mantenimiento</span>
          </Link>
        </li>
        <li>
          <Link
            href="/citas"
            className="flex items-center hover:text-[#d1e7ff] transition-colors"
          >
            <Calendar className="mr-2" size={20} />
            <span>Gestión de Citas</span>
          </Link>
        </li>
      </ul>
      <div className="absolute bottom-5">
        <Link
          href="/ayuda"
          className="flex items-center hover:text-[#d1e7ff] transition-colors"
        >
          <HelpCircle className="mr-2" size={20} />
          <span>Ayuda</span>
        </Link>
      </div>
    </nav>
  );
}
