import { Link } from "react-router-dom";



function Header({user}){

    return(
        <header>
            <div className="h-logo">

            </div>
            <div>
                <div className="h-theme">
                    {/* <div>
                        
                    </div> */}
                </div>
                <div className="h-profil">
                    {user.nom?
                        <>
                            <div>
                                <img src="/patrie.jpg" alt="error"/>
                            </div>
                            <div>
                                <p>
                                    <Link to="/profil">
                                    {user.prenom+" "+user.nom}
                                    </Link>
                                </p>
                                <p>{user.role.replaceAll("_"," ")}</p>
                            </div>
                        </>
                    :
                        <></>
                    }
                </div>
            </div>
        </header>
    );
    


}

export default Header;