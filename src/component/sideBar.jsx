import { NavLink } from "react-router-dom"


function SideBar({role}){


    const handleClick=()=>{

        let decision =window.confirm("voulez vous vraiment vous déconnecter?")
        if(decision){
            localStorage.clear()
            window.location.href="/login"
        }
    }

    const derouler=(e)=>{
        
        e.preventDefault()
        let element=e.target
        element.classList.toggle("visibility")
    }

    return(
        <div className="sideBar">
            <div className="s-logo">
                <img src="/logo.png" alt="error"/>
                <p>PROGMA FR</p>
            </div>
            <div className="s-navigation">
                <div>
                    <p>NAVIGATION</p>
                </div>
                <nav>
                    {["ACO","CO","DCO","DAF","COMPTABLE FR","STAGIAIRE"].includes(role)?
                    <ul>
                        <li><NavLink to="/acceuil">Tableau de bord</NavLink></li>
                        <li><NavLink to="/programmes/soumis">Programmes en cours</NavLink></li>
                        <li><NavLink to="/execution-des-programme">Execution des programmes</NavLink></li>
                        <li><NavLink to="/synthese-programme">Synthèse des programmes</NavLink></li>
                        <li><NavLink to="/suivi-des-paiements">Suivi des paiements</NavLink></li>
                        <li><NavLink to="/programmes-cloturés">Programmes cloturés</NavLink></li>
                    </ul>
                    :role==="ADMIN"?
                    <ul>
                        <li><NavLink to="/acceuil">Tableau de bord</NavLink></li>
                        <li><NavLink to="/programmes/soumis">Programmes en cours</NavLink></li>
                        <li><NavLink to="/execution-des-programme">Execution des programmes</NavLink></li>
                        <li><NavLink to="/synthese-programme">Synthèse des programmes</NavLink></li>
                        <li><NavLink to="/suivi-des-paiements">Suivi des paiements</NavLink></li>
                        <li><NavLink to="/programmes-cloturés">Programmes cloturés</NavLink></li>
                        <li><NavLink to="/paramètres">Paramètres</NavLink></li>

                    </ul>
                    :["MINHDU","MINTP","MINT"].includes(role)?
                    <ul>
                        <li><NavLink to="/acceuil">Tableau de bord</NavLink></li>
                        <li><NavLink to="/créer-programme">Créer un programme</NavLink></li>
                        <li>
                            <NavLink to="/programmation" onClick={derouler}><i className="fa-solid fa-chevron-right i-direction"></i> Programmation </NavLink>
                            <ul className="deroulant">
                                <li><NavLink to="/programmation/engagement">Engagement</NavLink></li>
                                <li><NavLink to="/programmation/suivi-travaux">Suivi des travaux</NavLink></li>  
                                <li><NavLink to="/programmation/suivi-paiements">Suivi des paiements</NavLink></li>  
                            </ul>
                        </li>
                        <li><NavLink to="/programmes">Programmes en cours</NavLink></li>
                        <li><NavLink to={`/programme-${role}/synthese`}>Synthèse des programmes</NavLink></li>
                        {/* <li><NavLink to="/suivi-payements">Suivi des payements</NavLink></li> */}
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