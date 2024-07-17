import { useNavigate } from "react-router-dom";


function PageNotFound(){

    const navigate=useNavigate()


    return(
        <div className="notFound">

            <div className="flex">
                <div className="retour-container">
                    <button className="retour-btn" onClick={()=>navigate(-1)}>
                        <i className="fa-solid fa-arrow-left"></i>
                        Retour
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PageNotFound;