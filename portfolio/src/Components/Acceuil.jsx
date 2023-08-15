import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './Acceuil.css';
import Pic from '../Icons/ort.JPG';
import Carousel from './Carousel';

function Acceuil() {
  return (
    <div className=''>
      <div className="container">
        <div className="row">
          <div className="col-md-7">
            <div className="col">
              <div className="row mt-5">
                <h1 className='fw-bold text-dark mx-md-5'>MAFTOUH Omar</h1>
              </div>
              <div className="row">
                <h5 className='text-success mx-md-5'>Full Stack Developer</h5>
              </div>
            </div>
            <div className="col">
              <div className="row mx-md-3">
                <p>
                  Passionné de développement Full Stack, maîtrisant HTML, CSS, JavaScript
                  (React) en front-end, et Python, PHP, Node.js (Laravel, Express) en back-end.
                  Attentif à la sécurité, diplômé en Développement Digital et prêt à contribuer à
                  votre succès. Expérience avec WordPress.
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <button className='btn btn-success mx-md-4 my-3 px-5 py-3'>Let's get started</button>
              </div>
            </div>
          </div>
          <div className="col-md-5 mt-3">
            <img src={Pic} className='img-fluid border border-dark border-3' alt="Profile" />
          </div>
        </div>
        <div className="row mt-4">
          <div className="col text-center">
            <h3 className='fw-bold'>Competences</h3>
          </div>
          <div className="row">
            <div className="col">
              <Carousel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Acceuil;
