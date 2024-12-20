import { Link } from "react-router-dom";



function Header({user,onSlideBar}){

    

    return(
        <header>
            <div className="h-logo">
                <div className="bar-slide">
                    <i className="fa-solid fa-bars" onClick={onSlideBar}></i>
                </div>
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
                                <p>{user.role.roleName }{user.administration!=="FR" &&  " "+user.administration}</p>
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