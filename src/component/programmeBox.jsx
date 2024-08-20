import { numStr } from "../script";
import { useRef, useState } from "react";
import ModalBox from "./modalBox";
import { Link } from "react-router-dom";

function ProgrammeBox({data,modalBox,modalBox1,onChange,onLoad}){

    let[menu,setMenu]=useState(false)

    let modalBox2=useRef()

    const handleClick=()=>{
        setMenu(true)
    }

    const mousLeave=()=>{
        setMenu(false)
    }

    const sClick=(id,modal)=>{
        onChange(id)
        modal.current.setModal(true)
    }


    return(
        <>
            <div className="box pg-box" >
                <div className="pg-hidden" onMouseLeave={mousLeave}>
                    <div><i className="fa-solid fa-ellipsis" onClick={handleClick}></i></div>
                    {menu &&(
                        <div className="hidden-menu">
                            <ul>
                                <li><Link to={"/modifier-programme/"+data.id} >Modifier</Link></li>
                                <li onClick={()=>sClick(data.id,modalBox1)}>Ajuster</li>
                                <li onClick={()=>sClick(data.id,modalBox)}>Supprimer</li>
                            </ul>
                        </div>
                    )}
                    
                </div>
                <div className="programme-line">
                    <div className="b-col">
                        <div>Intitulé</div>
                        <div><Link to={`/programmes/programme-${data.ordonnateur}/${data.id}`}>{data.intitule}</Link></div>
                    </div>
                    <div className="b-col">
                        <div>Ordonnateur</div>
                        <div>{data.ordonnateur}</div>
                    </div>
                    <div className="b-col">
                        <div>Année</div>
                        <div>{data.annee}</div>
                    </div>
                    <div className="b-col">
                        <div>Budget total</div>
                        <div> {numStr(data.budget, 0) } fcfa</div>
                    </div>
                    <div className="b-col">
                        <div>statut</div>
                        <div>
                            <div className="desc warning">
                                {data.statut.replaceAll("_"," ").replaceAll("ER","É")}
                            </div>
                        </div>
                    </div>
                    {(data.observation || data.url_resolution) &&
                    (
                    <div className="b-col">
                        <div>Plus d'info</div>
                        <div>
                            <i className="fa-solid fa-circle-plus" onClick={()=>modalBox2.current.setModal(true)} ></i>                   
                        </div>
                    </div> 
                    )}
                </div>
            </div>

            
            <ModalBox ref={modalBox2}>
                <div className="pg-detail">
                    {data.observation &&(
                    <div className="detail-col">
                        <div>Observation</div>
                        <p>{data.observation}</p>
                    </div>
                    )}

                    {data.url_resolution &&(
                    <div className="detail-col">
                        <div>resolution signée</div>
                        <p className="sign" onClick={()=>onLoad(data.id,modalBox2)}>Voir la resolution signée</p>
                    </div>
                    )}
                </div>
            </ModalBox>

        </>
    )
}

export default ProgrammeBox;