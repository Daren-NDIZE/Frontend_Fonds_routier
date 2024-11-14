import { useEffect, useState,useRef } from "react";
import SearchBar from "../../component/searchBar";
import { fetchGet} from "../../config/FetchRequest";
import Notification from "../../component/notification";
import Loader from "../../component/loader";
import { numStr } from "../../script";
import { Link } from "react-router-dom";
import ModalBox from "../../component/modalBox";

function SubmitProgramme(){

    let [programme,setProgramme]=useState([])
    let [detail,setDetail]=useState({})
    let [loader,setLoader]=useState(true)


    let notification=useRef()
    let modalBox=useRef()

    useEffect(()=>{

        (async function(){

            try{
                const res= await fetchGet("getSubmitProgramme")

                if(res.ok){
                    const resData= await res.json()
                    setProgramme(resData)
                }
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }
            
        })()

    },[])

    
    const details=(observation,resolution)=>{

        setDetail({observation: observation, resolution: resolution})
        modalBox.current.setModal(true)

    }

    


    if(loader){
        return(
            <Loader/>
        )
    }

    return(
        <div className="container">

            <Notification ref={notification} />

            
            <div className="box b-search">
                <SearchBar/>
            </div>

            {programme.length!==0?

                programme.map((i,j)=>
                
                <div className="box pg-box" key={j}>
                    <div className="programme-line">
                        <div className="b-col">
                            <div>Intitulé</div>
                            <div><Link to={`/programmes/soumis/${i.id}`}>{i.intitule}</Link></div>
                        </div>
                        <div className="b-col">
                            <div>Ordonnateur</div>
                            <div>{i.ordonnateur}</div>
                        </div>
                        <div className="b-col">
                            <div>Année</div>
                            <div>{i.annee}</div>
                        </div>
                        <div className="b-col">
                            <div>Budget total</div>
                            <div> {numStr(i.budget, 0) } fcfa</div>
                        </div>
                        <div className="b-col">
                            <div>statut</div>
                            <div>
                                <div className="desc warning">
                                    {i.statut.replaceAll("_"," ").replaceAll("ER","É")}
                                </div>
                            </div>
                        </div>
                        {i.observation &&(
                            <div className="b-col">
                                <div>Plus d'info</div>
                                <div>
                                    <i className="fa-solid fa-circle-plus" onClick={()=>details(i.observation, i.url_resolution)} ></i>                   
                                </div>
                            </div> 
                        )}

                    </div>
                </div>
                
                )
            :
                <div className="vide">VIDE</div>
            }

            <ModalBox ref={modalBox}>
                <div className="pg-detail">
                    <div className="detail-col">
                        <div>Observation</div>
                        <p>{detail.observation}</p>
                    </div>

                    {detail.resolution &&(
                    <div className="detail-col">
                        <div>resolution signée</div>
                        <p><Link to="">{detail.resolution}</Link></p>
                    </div>
                    )}
                </div>
            </ModalBox>

    
        </div>
    )
}

export default SubmitProgramme;