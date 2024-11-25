import { useNavigate } from "react-router-dom";
import SearchBar from "../../component/searchBar"



function Param(){

    const navigate=useNavigate()

    const nav=(endpoint)=>{
        navigate(`/paramètres/${endpoint}`)
    }

    return(
        <div className="container">

            <div className="box b-search">
                <SearchBar/>
            </div>

           <div className="param">
                <div className="box" onClick={()=>nav("gestion-des-utilisateurs")}>
                    <p>Gestion des utilisateurs</p>
                </div>
                <div className="box" onClick={()=>nav("gestion-des-roles")}>
                    <p>Gestion des roles</p>
                </div>
                
           </div>
           <div className="param">
                <div className="box" onClick={()=>nav("suivi-des-actions")}>
                    <p>Suivi des actions</p>
                </div>
                <div className="box" onClick={()=>nav("gestion-des-permissions")}>
                    <p>Gestion des permissions</p>
                </div>
           </div>
           
        </div>
    )
}


export default Param;