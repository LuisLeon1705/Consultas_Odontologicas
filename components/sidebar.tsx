"use client";

import logo from "@/components/images/logo.jpg";
import {
  faBoxes,
  faCalendarCheck,
  faExternalLinkSquareAlt,
  faFileInvoiceDollar,
  faHome,
  faProcedures,
  faShoppingCart,
  faStethoscope,
  faTools,
  faTooth,
  faUsers,
  faVial,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: any;
}

/**
 * Sidebar component that hides items based on user modules.
 */
export function Sidebar() {
  const [modules, setModules] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          setModules(user.modulos || []);
        } catch {
          setModules([]);
        }
      }
    }
  }, []);

  const navItems: NavItem[] = [
    { id: "home", href: "/", label: "Inicio", icon: faHome },
    { id: "10", href: "/personal", label: "Gestión de Personal", icon: faUsers },
    { id: "4", href: "/laboratorio", label: "Laboratorio", icon: faVial },
    { id: "3", href: "/inventario", label: "Inventario", icon: faBoxes },
    { id: "1", href: "/compras", label: "Compras", icon: faShoppingCart },
    { id: "6", href: "/consultas-odontologicas", label: "Consultas Odontológicas", icon: faTooth },
    { id: "7", href: "/consultas-medicas", label: "Consultas Médicas", icon: faStethoscope },
    { id: "9", href: "/administracion", label: "Administración", icon: faFileInvoiceDollar },
    { id: "5", href: "/hospitalizacion", label: "Hospitalización", icon: faProcedures },
    { id: "2", href: "/mantenimiento", label: "Mantenimiento", icon: faTools },
    { id: "8", href: "/citas", label: "Gestión de Citas", icon: faCalendarCheck },
  ];

  const filteredItems = navItems.filter(
    (item) => item.id === "home" || modules.includes(item.id)
  );

  return (
    <nav className="w-64 bg-[#007bff] text-white p-5 h-screen relative">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src={logo}
          alt="Grey + Sloan Memorial Hospital"
          width={150}
          height={50}
        />
      </div>

      {/* Navigation links */}
      <ul className="space-y-4">
        {filteredItems.map((item) => (
          <li key={item.id} id={item.id}>
            <Link
              href={item.href}
              className="flex items-center hover:text-[#d1e7ff] transition-colors"
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="mr-2 w-4 h-4"
              />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout link at bottom */}
      <div className="absolute bottom-5">
        <Link
          href="/logout"
          className="flex items-center hover:text-[#d1e7ff] transition-colors"
        >
          <FontAwesomeIcon
            icon={faExternalLinkSquareAlt}
            className="mr-2 w-4 h-4"
          />
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </nav>
  );
}
