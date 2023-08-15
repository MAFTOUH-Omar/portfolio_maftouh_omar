import MernStack from '../Icons/mern-stack.png';
import DemoPdo from '../Icons/demoPdo.png';
import ReactLaravel from '../Icons/reactLaravel.png';
import Typ from '../Icons/Typ.png';
import Enm from '../Icons/enm.png';
function Projets(){
    return(
        <div className="container my-4">
            <div className="row">
                <div className="col text-center">
                    <h3 className="fw-bold">Projets</h3>
                </div>
            </div>
            <div className="row my-3">
                <div className="col-sm-12 col-md-6 col-lg-3">
                    <div className="card" style={{height:"330px"}}>
                        <img src={MernStack} style={{height:"100px"}} className='card-img-top img-fluid'/>
                        <div className="card-body">
                            <p>
                            Sample app: Express.js, MongoDB, JWT auth, Message model. Dockerfiles & Compose for deployment.</p>
                        </div>
                        <div className="card-footer">
                            <a className='btn btn-dark form-control' href='https://github.com/MAFTOUH-Omar/auth-message-docker-mern'>Code</a>
                        </div>
                    </div>
                </div>
                <div className="col-sm-12 col-md-6 col-lg-3">
                    <div className="card" style={{height:"330px"}}>
                        <img src={DemoPdo} style={{height:"100px"}} className='card-img-top img-fluid'/>
                        <div className="card-body">
                            <p>
                            App de gestion d'utilisateurs (CRUD), espace admin pour déclarations (CR), espace tech pour résoudre les problèmes admin.
                            </p>
                        </div>
                        <div className="card-footer">
                            <a className='btn btn-dark form-control' href='https://github.com/MAFTOUH-Omar/Gestion-Utilisateur-Declaration'>Code</a>
                        </div>
                    </div>
                </div>
                <div className="col-sm-12 col-md-6 col-lg-3">
                    <div className="card" style={{height:"330px"}}>
                        <img src={ReactLaravel} style={{height:"100px"}} className='card-img-top img-fluid'/>
                        <div className="card-body">
                            <p>
                            Création d'une application web pour gérer des annonces avec ReactJS et Laravel
                            </p>
                        </div>
                        <div className="card-footer">
                            <div className="row">
                                <div className="col">
                                    <a className='btn btn-dark form-control' href='https://github.com/MAFTOUH-Omar/Quick_Annonce_client'>Code</a>
                                </div>
                                <div className="col">
                                    <a className='btn btn-success form-control' href='https://quick-annonce-client.vercel.app/'>Web</a>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
                <div className="col-sm-12 col-md-6 col-lg-3">
                    <div className="card" style={{height:"330px"}}>
                        <img src={Typ} style={{height:"100px"}} className='card-img-top img-fluid'/>
                        <div className="card-body">
                            <p>
                            Boost task management using Vite-powered Kanban board. Streamline workflow, optimize goals with intuitive drag-and-drop features.</p>
                        </div>
                        <div className="card-footer">
                            <div className="row">
                                <div className="col">
                                    <a className='btn btn-dark form-control' href='https://github.com/MAFTOUH-Omar/Kanban_Board'>Code</a>
                                </div>
                                <div className="col">
                                    <a className='btn btn-success form-control' href='https://kanban-board-maftouh.netlify.app/'>Web</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-sm-12 col-md-6 col-lg-3">
                    <div className="card" style={{height:"330px"}}>
                        <img src={Enm} style={{height:"100px"}} className='card-img-top img-fluid'/>
                        <div className="card-body">
                            <p>
                            Express App with Database Deployments (Cloud MongoDB clusters)     
                            </p>                    
                        </div>
                        <div className="card-footer">
                            <a className='btn btn-dark form-control' href='https://github.com/MAFTOUH-Omar/Express-MongoDB-Cloud'>Code</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Projets;