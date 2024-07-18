import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {  fetchGet } from "../../config/FetchRequest";
import Loader from "../../component/loader";
import SearchBar from "../../component/searchBar";
import { numStr } from "../../script";
import Notification from "../../component/notification";


function Prevision(){

    let [programme,setProgramme]=useState({})
    let [data,setData]=useState([])
    let [loader,setLoader]=useState(true)

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
                let res = await fetchGet(`programmeByRole/${id}`)
                if(res.ok){
                    let resData= await res.json()

                    if(resData.type==="erreur" || resData.statut!=="VALIDER" || resData.ordonnateur!==ordonnateur.substring(10) ){
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


    if(loader){
        return(
            <Loader/>
        )
    }

    return(
        <div className="container">

            <Notification ref={notification} />

            <div style={{display: 'flex'}}>
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
                </div>
             
                {programme.ordonnateur==="MINHDU"?

                    <MINHDU data={data}/>

                :programme.ordonnateur==="MINTP"?

                    <></>
                :
                    <MINT data={data} />
                }
            </div>

        </div>
    )
}


export default Prevision;

const MINHDU=({data})=>{

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th>Ville</th>
                        <th className="min-w13">Type_de_travaux</th>
                        <th className="min-w1">Troçons / Intitulé</th>
                        <th>Linéaire_(ml)</th>
                        <th>Cout_total_du_projet_TTC</th>
                        <th className="min-w4">Engagement</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w3">Prestataires</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((i,j)=>
                        <tr key={j}>
                            <td>{j+1}</td>
                            <td>{i.region.replaceAll("_","-")}</td>
                            <td>{i.ville}</td>
                            <td>{i.type_travaux}</td>
                            <td>{i.troçon}</td>
                            <td>{numStr(i.lineaire)}</td>
                            <td>{numStr(i.ttc)} fcfa</td>
                            <td>{numStr(i.budget_n)} fcfa</td>
                            <td>{i.ordonnateur}</td>
                            <td>{i.prestataire}</td>
                            
                        </tr>
                    )
                    }
                    
                </tbody>
            </table>
        </div>
    )
}

const MINT=({data})=>{

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°_de_lot</th>
                        <th>Region</th>
                        <th className="min-w1">Mission</th>
                        <th className="min-w1">Objectifs</th>
                        <th>Allotissement</th>
                        <th>Cout_total_du_projet_TTC</th>
                        <th className="min-w4">Engagement</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w3">Prestataires</th> 
                    </tr>
                </thead>
                <tbody> 
                {data.map((i,j)=>
                        <tr key={j}>
                            <td>{j+1}</td>
                            <td>{i.region.replaceAll("_","-")}</td>
                            <td>{i.mission}</td>
                            <td>{i.objectif}</td>
                            <td>{i.allotissement}</td>
                            <td>{numStr(i.ttc)} fcfa</td>
                            <td>{numStr(i.budget_n)} fcfa</td>
                            <td>{i.ordonnateur}</td>
                            <td>{i.prestataire}</td>
                        </tr>
                        
                    )}
                </tbody>
            </table>
        </div>    )
}

const MINTP=({data})=>{

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th className="min-w2">Catégorie</th>
                        <th className="min-w1">Projets/troçons</th>
                        <th>Code route</th>
                        <th>Linéaire_route (km)</th>
                        <th>Linéaire_OA (ml)</th>
                        <th>Montant_TTC_projet</th>
                        <th className="min-w4">Engagement</th>
                        <th className="min-w3">Pretataire</th>
                    </tr>
                </thead>
                <tbody>
                {
                    data.map((i,j)=>
                    <tr key={j}>
                        <td>{j+1}</td>
                        <td>{i.region.replaceAll("_","-")}</td>
                        <td>{i.categorie}</td>
                        <td>{i.projet}</td>
                        <td>{i.code_route}</td>
                        <td>{numStr(i.lineaire_route)}</td>
                        <td>{numStr(i.lineaire_oa)}</td>
                        <td>{numStr(i.ttc)}</td>
                        <td>{numStr(i.budget_n) }</td>
                        <td>{i.prestataire}</td>
                    </tr>

                )}
                    
                </tbody>
            </table>
        </div>  
    )
}