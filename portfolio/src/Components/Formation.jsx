import Academy from '../Icons/Academy';
function Formation(){
    return(
        <div className="bg-dark rounded-2 py-4">
            <div className="container">
                <div className="row">
                    <div className="col text-center">
                        <h3 className="text-light fw-bold">Formation</h3>
                    </div>
                </div>
                <div className="row my-3">
                    <div className="col border border-light border-2 rounded-2">
                        <Academy/>
                        <p className='text-light fw-bold'>
                            * 2021-2023 Institut Spécialisé de Gestion et d'Informatique - OFPPT KHOURIBGA
                        </p>
                        <p className='badge bg-success text-light fw-bold'>
                            Diplome Technicien Spécialisé en Developpement Digiatl Option Full Stack
                        </p>
                    </div>
                </div>
                <div className="row my-3">
                    <div className="col border border-light border-2 rounded-2">
                        <Academy/>
                        <p className='text-light fw-bold'>
                            * 2020-2021 LYCEE QUALIFIANT AL MOUAHIDINE
                        </p>
                        <p className='badge bg-success text-light fw-bold'>
                             fw-boldBaccalauréat en Sciences de la Vie et de la Terre
                        </p>
                    </div>
                </div>
                <div className="row my-3">
                    <div className="col border border-light border-2 rounded-2">
                        <Academy/>
                        <p className='text-light fw-bold'>
                            * 2023 TECH57
                        </p>
                        <p className='badge bg-secondary text-light fw-bold'>
                            Certification Développement Web Wordpress
                        </p>
                    </div>
                </div>
                <div className="row my-3">
                    <div className="col border border-light border-2 rounded-2">
                        <Academy/>
                        <p className='text-light fw-bold'>
                            * 2023 Certiport
                        </p>
                        <p className='badge bg-secondary text-light fw-bold'>
                            Microsoft Office Specialist Master
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Formation;