import { NavLink } from "react-router-dom"


function SideBar({role}){


    const handleClick=()=>{

        let decision =window.confirm("voulez vous vraiment vous déconnecter?")
        if(decision){
            localStorage.clear()
            window.location.href="/login"
        }
    }

    return(
        <div className="sideBar">
            <div className="s-logo">
                <img src="/logo.png" alt="error"/>
                <p>COWEB FR</p>
            </div>
            <div className="s-navigation">
                <div>
                    <p>NAVIGATION</p>
                </div>
                <nav>
                    {role==="ADIM"?

                    <></>
                    :role==="FONDS_ROUTIER"?
                    <ul>
                        <li><NavLink to="/programmes/soumis">Programmes en cours</NavLink></li>
                        <li><NavLink to="/execution-des-programme">Execution des programmes</NavLink></li>
                        <li><NavLink to="/synthese-programme">Synthèse des programmes</NavLink></li>
                        <li><NavLink to="/suivi-des-payements">Suivi des payements</NavLink></li>
                        <li><NavLink to="/programmes-cloturés">Programmes cloturés</NavLink></li>
                    </ul>
                    :role==="ADMIN"?
                    <ul>
                        <li><NavLink to="/programmes/soumis">Programmes en cours</NavLink></li>
                        <li><NavLink to="/execution-des-programme">Execution des programmes</NavLink></li>
                        <li><NavLink to="/synthese-programme">Synthèse des programmes</NavLink></li>
                        <li><NavLink to="/suivi-des-payements">Suivi des payements</NavLink></li>
                        <li><NavLink to="/programmes-cloturés">Programmes cloturés</NavLink></li>
                        <li><NavLink to="/gestion-des-utilisateurs">Gestion des utilisateurs</NavLink></li>
                        <li><NavLink to="/paramètres">Paramètres</NavLink></li>

                    </ul>
                    :role==="MINT" || role==="MINTP" || role==="MINHDU"?
                    <ul>
                        <li><NavLink to="/créer-programme">Créer un programme</NavLink></li>
                        <li><NavLink to="/programmes">Programmes en cours</NavLink></li>
                        <li><NavLink to="/programmes_cloturés">Programmes cloturés</NavLink></li>
                    </ul>
                    :
                    <></>
                    }
                    
                    
                </nav>
            </div>
            <div className="s-bottom">
                <button onClick={handleClick}>
                    Déconnexion 
                    <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
            </div>
        </div>
    )
}

export default SideBar;