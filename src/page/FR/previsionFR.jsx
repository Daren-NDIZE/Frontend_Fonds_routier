import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Fetch, fetchGet } from "../../config/FetchRequest";
import Loader from "../../component/loader";
import SearchBar from "../../component/searchBar";
import { numStr } from "../../script";
import PageLoader from "../../component/pageLoader";
import ModalBox from "../../component/modalBox";
import Notification from "../../component/notification";


function PrevisionFR(){

    let [programme,setProgramme]=useState({})
    let [data,setData]=useState([])
    let [deleteId,setDeleteId]=useState()
    let [pageLoader,setPageLoader]=useState()
    let [loader,setLoader]=useState(true)
    let [check,setCheck]=useState(false)

    let modalBox=useRef()
    let notification=useRef()

    const navigate=useNavigate()
    const {id}=useParams()
    const {ordonnateur}=useParams()


    useEffect(()=>{
        (async function (){

            let type=["programme-MINT","programme-MINTP","programme-MINHDU"]
            if(isNaN(id) || !type.includes(ordonnateur)){
                navigate(-1)
                return;
            }
            try{
                let res = await fetchGet(`programme/${id}`)
                if(res.ok){
                    let resData= await res.json()

                    if(resData.type==="erreur" || resData.statut!=="VALIDER" || resData.ordonnateur!==ordonnateur.substring(10)){
                        navigate(-1)
                    }else{
                        resData.projetList=resData.projetList.filter(i=>i.financement==="RESERVE")
                        setProgramme(resData)
                        setData(resData.projetList)
                    }
                }
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }

        })()
    },[id,ordonnateur,navigate])

    const deleted= async (id)=>{

        setPageLoader(true)
        modalBox.current.setModal(false)

        try{
            let res= await Fetch(`deletePrevisionProjet/${id}`,"DELETE")
            if(res.ok){
                let resData= await res.json()

                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )

                if(resData.type==="succes"){
    
                    data=data.filter(i=>i.id!==id)
                    programme.projetList=programme.projetList.filter(i=>i.id!==id)
                    setData(data)
                }
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }
 
    }

    const change=(e)=>{
        setCheck(e.target.checked)
    }

    const openModal=(id)=>{
        setDeleteId(id)
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

            <div className="flex">
                <div className="retour-container">
                    <button className="retour-btn" onClick={()=>navigate(-1)}>
                        <i className="fa-solid fa-arrow-left"></i>
                         Retour
                    </button>
                </div>
                <div className="box b-search">
                    <SearchBar/>
                </div>
            </div>
            
            <div className="box">
                <div id="pg-title"> 
                    <h1>Détails prévison {`${programme.ordonnateur} ${programme.annee}`}</h1>
                    <button className="download-btn" >
                        <i className="fa-solid fa-down-long"></i>
                    </button>
                </div>
                
                <div className="top-element">
                    <div className="check-update">
                        <label htmlFor="check">Modifier</label>
                        <input type="checkbox" id="check" onChange={change}/>
                    </div>
                    <div className="n-projet">
                        <button>Nouveau</button>
                    </div>
                </div> 


                

                {programme.ordonnateur==="MINHDU"?

                    <MINHDU data={data} check={check} onModal={openModal} />

                :programme.ordonnateur==="MINTP"?

                    <MINTP data={data} check={check} onModal={openModal} />
                :
                    <MINT data={data} check={check} onModal={openModal} />
                }
            </div>

            <ModalBox ref={modalBox}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer ce projet?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={()=>deleted(deleteId)}>OUI</button>
                        <button className="b-btn" onClick={()=>{modalBox.current.setModal(false)}}>NON</button>
                    </div>
                </div>
            </ModalBox>

            {pageLoader &&(
                <PageLoader/>
            )}
        </div>
    )
}


export default PrevisionFR;

const MINHDU=({data,check,onModal})=>{

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th>Ville</th>
                        <th>Type_de_travaux</th>
                        <th>Troçons</th>
                        <th>Linéaire_(ml)</th>
                        <th>Cout_total_du_projet_TTC</th>
                        <th>Engagement</th>
                        <th>Ordonnateurs</th>
                        <th>Prestataires</th>
                        {check &&(
                            <th>Action</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((i,j)=>
                        <tr key={j}>
                            <td>{j+1}</td>
                            <td>{i.region.replaceAll("_","-")}</td>
                            <td>{i.ville}</td>
                            <td className="min-w1">{i.type_travaux}</td>
                            <td className="min-w1">{i.troçon}</td>
                            <td>{numStr(i.lineaire)}</td>
                            <td>{numStr(i.ttc)} fcfa</td>
                            <td className="min-w4">{numStr(i.budget_n)} fcfa</td>
                            <td>{i.ordonnateur}</td>
                            <td className="min-w3">{i.prestataire}</td>
                            {check &&(
                            <td> 
                                <div className="t-action">
                                    <i className="fa-solid fa-trash-can" onClick={()=>onModal(i.id)} ></i>
                                </div>
                            </td>
                            )}
                        </tr>
                    )
                    }
                    
                </tbody>
            </table>
        </div>
    )
}

const MINT=({data,check,onModal})=>{

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°_de_lot</th>
                        <th>Region</th>
                        <th>Mission</th>
                        <th>Objectifs</th>
                        <th>Allotissement</th>
                        <th>Cout_total_du_projet_TTC</th>
                        <th>Engagement</th>
                        <th>Ordonnateurs</th>
                        <th>Prestataires</th> 
                        {check &&(
                            <th>Action</th>
                        )}
                    </tr>
                </thead>
                <tbody> 
                {data.map((i,j)=>
                        <tr key={j}>
                            <td>{j+1}</td>
                            <td>{i.region.replaceAll("_","-")}</td>
                            <td className="min-w1">{i.mission}</td>
                            <td className="min-w1">{i.objectif}</td>
                            <td>{i.allotissement}</td>
                            <td>{numStr(i.ttc)} fcfa</td>
                            <td className="min-w4">{numStr(i.budget_n)} fcfa</td>
                            <td>{i.ordonnateur}</td>
                            <td className="min-w3">{i.prestataire}</td>
                            {check &&(
                            <td> 
                                <div className="t-action">
                                    <i className="fa-solid fa-trash-can" onClick={()=>onModal(i.id)} ></i>
                                </div>
                            </td>
                            )}
                        </tr>
                        
                    )}
                </tbody>
            </table>
        </div>    )
}

const MINTP=({data,check,onModal})=>{

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th>Catégorie</th>
                        <th>Projets/troçons</th>
                        <th>Code route</th>
                        <th>Linéaire_route (km)</th>
                        <th>Linéaire_OA (ml)</th>
                        <th>Montant_TTC_projet</th>
                        <th>Engagement</th>
                        <th>Pretataire</th>
                        {check &&(
                            <th>Action</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                {
                    data.map((i,j)=>
                    <tr key={j}>
                        <td>{j+1}</td>
                        <td>{i.region.replaceAll("_","-")}</td>
                        <td className="min-w2">{i.categorie}</td>
                        <td className="min-w1">{i.projet}</td>
                        <td>{i.code_route}</td>
                        <td>{numStr(i.lineaire_route)}</td>
                        <td>{numStr(i.lineaire_oa)}</td>
                        <td>{numStr(i.ttc)}</td>
                        <td className="min-w4">{numStr(i.budget_anterieur)}</td>
                        <td className="min-w4">{numStr(i.budget_n) }</td>
                        <td className="min-w3">{i.prestataire}</td>
                        {check &&(
                            <td> 
                                <div className="t-action">
                                    <i className="fa-solid fa-trash-can" onClick={()=>onModal(i.id)} ></i>
                                </div>
                            </td>
                        )}
                    </tr>

                )}
                    
                </tbody>
            </table>
        </div>  
    )
}