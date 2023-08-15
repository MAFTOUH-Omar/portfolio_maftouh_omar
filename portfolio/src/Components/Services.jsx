import WebDev from '../Icons/WebDev';
import Conception from '../Icons/Conception';
import Backend from '../Icons/Backend';
import Securiter from '../Icons/Securiter';
import Optimisation from '../Icons/Optimisation';
function Services(){
    return(
        <div className="container my-4">
            <div className="row text-center">
                <div className="col">
                    <h3 className="fw-bold">Services</h3>
                </div>
            </div>
            <div className="row justify-content-center mt-4">
                <div className="col-md-4 col-sm-6 mb-4 col-lg-3 border border-dark rounded-2 bg-success text-center mx-1 border-2">
                    <h4 className="fw-bold text-light"><WebDev/><p>Développement des sites web</p></h4>
                </div>
                <div className="col-md-4 col-sm-6 mb-4 col-lg-3 border border-dark rounded-2 bg-success text-center mx-1 border-2">
                    <h4 className="fw-bold text-light"><Conception/><p>Intégration de Conception</p></h4>
                </div>
                <div className="col-md-4 col-sm-6 mb-4 col-lg-3 border border-dark rounded-2 bg-success text-center mx-1 border-2">
                    <h4 className="fw-bold text-light"><Backend/><p>Développement Back-End & Front-End</p></h4>
                </div>
            </div>
            <div className="row justify-content-center mt-4">
                <div className="col-md-4 col-sm-6 mb-4 col-lg-3 border border-dark rounded-2 bg-success text-center mx-1 border-2">
                    <h4 className="fw-bold text-light"><Securiter/><p>Sécurité et Maintenance</p></h4>
                </div>
                <div className="col-md-4 col-sm-6 mb-4 col-lg-3 border border-dark rounded-2 bg-success text-center mx-1 border-2">
                    <h4 className="fw-bold text-light"><Optimisation/><p>Optimisation de la Performance</p></h4>
                </div>
            </div>
        </div>
    )
}
export default Services;