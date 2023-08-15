import Cv from '../Icons/CV MAFTOUH Omar.pdf';
import Download from '../Icons/Download';
function Apropos() {
    return (
      <div className="bg-dark rounded-2 py-4">
        <div className="container">
          <div className="row">
            <div className="col text-center mt-4">
              <h3 className="fw-bold text-light">À propos de moi</h3>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <h4 className="text-light">Bonjour</h4>
              <p className="fw-bold text-light">
                Je suis MAFTOUH Omar, un développeur Web. Mon parcours m'a permis d'acquérir une solide expérience en conception, construction et personnalisation de sites Web. Je possède également une expertise reconnue dans l'utilisation de WordPress.
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <li className="text-light fw-bold">Prénom & Nom :</li>
              <span className="badge bg-success text-light">MAFTOUH Omar</span>
            </div>
            <div className="col-md-6">
              <li className="text-light fw-bold">Contact :</li>
              <span className="badge bg-success text-light">0604-534791</span>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <li className="text-light fw-bold">Emplacement :</li>
              <span className="badge bg-success text-light">Khouribga, Maroc</span>
            </div>
            <div className="col-md-6">
              <li className="text-light fw-bold">Courriel :</li>
              <span className="badge bg-success text-light">omarmaftouh2022@gmail.com</span>
            </div>
          </div>
          <div className="row justify-content-center mt-4">
            <div className="col-md-6 text-center">
              <a href={Cv} download>
                <button className="btn btn-light px-4 py-2">Télécharger le cv&nbsp;&nbsp;<Download /></button>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default Apropos;
  