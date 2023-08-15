import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './Menu.css';
import Acceuil from './Acceuil';
import Apropos from './Apropos';
import Services from './Services';
import Formation from './Formation';
import Projets from './Projets';
import Contact from './Contact';
function Menu() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
        <div className="container">
        <nav className={`navbar navbar-expand-lg py-3 flex text-center border border-light border-3 ${menuOpen ? 'show' : ''}`}>
        <button className="navbar-toggler" type="button" onClick={toggleMenu}>
            <span className="navbar-toggler-icon"></span>
        </button>
          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
            <ul className='navbar-nav mx-auto'>
              <li className='nav-item'>
                <a className='nav-link text-light mx-4' href="#Acceuil">Acceuil</a>
              </li>
              <li className='nav-item'>
                <a className='nav-link text-light mx-4' href="#Apropos">Apropos</a>
              </li>
              <li className='nav-item'>
                <a className='nav-link text-light mx-4' href="#Services">Services</a>
              </li>
              <li className='nav-item'>
                <a className='nav-link text-light mx-4' href="#Formation">Formation</a>
              </li>
              <li className='nav-item'>
                <a className='nav-link text-light mx-4' href="#Projets">Projets</a>
              </li>
              <li className='nav-item'>
                <a className='nav-link text-light mx-4' href="#Contact">Contact</a>
              </li>
            </ul>
          </div>
        </nav>
        </div>

        <div id="Acceuil"><Acceuil /></div>
        <div id="Apropos"><Apropos /></div>
        <div id="Services"><Services /></div>
        <div id="Formation"><Formation /></div>
        <div id="Projets"><Projets /></div>
        <div id="Contact"><Contact /></div>
        <footer className="bg-dark text-light text-center py-3">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} MAFTOUH Omar. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Menu;
