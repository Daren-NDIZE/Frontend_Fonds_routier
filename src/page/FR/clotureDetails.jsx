import { useRef,useState,useEffect } from "react"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import { Link, useNavigate, useParams } from "react-router-dom"
import { fetchFormData, fetchGet } from "../../config/FetchRequest"
import {  numStr, parseTable, totalBudget } from "../../script"
import ModalBox from "../../component/modalBox"
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { downLoadExcel } from "jsxtabletoexcel"



function ClotureDetails(){

    let modalBox1=useRef()
    let projet=useRef([])

    let [programme,setProgramme]=useState({})
    let [loader,setLoader]=useState(true)
    let [data,setData]=useState([])
    let [pdf,setPdf]=useState()
    let [categorie,setCategorie]=useState("CENTRALE")
    
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const {id}=useParams()
    const {ordonnateur}=useParams()
    const navigate=useNavigate()


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

                    if(resData.type==="erreur" || resData.statut!=="CLOTURER" || resData.ordonnateur!==ordonnateur.substring(10)){
                        navigate(-1)
                    }else{
                        setProgramme(resData)
                        projet.current=resData.projetList.filter(i=>i.financement!=="RESERVE")
                        if(resData.ordonnateur==="MINTP"){
                            setData(resData.projetList.filter(i=>(i.financement!=="RESERVE" && i.categorie!=="PROJET A GESTION COMMUNALE") ))
                            return;                  
                        }
                        setData(resData.projetList.filter(i=>i.financement!=="RESERVE"))
                    }
                }
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }

        })()
    },[id,ordonnateur,navigate])


    const changeTable=(e,i)=>{

        let li=e.target
        setCategorie(i)
        if(i==="CENTRALE"){
            setData(projet.current.filter(i=>i.categorie!=="PROJET A GESTION COMMUNALE"))
        }else{
            setData(projet.current.filter(i=>i.categorie==="PROJET A GESTION COMMUNALE"))
        }
        if(li.classList.contains("active")){
            return;
        }

        Array.from(li.parentNode.children).forEach(i=>{
            i.classList.remove("active")
        })
        li.classList.add("active")
    }


    
    const loadPdf=async(id)=>{

        modalBox1.current.setModal(true)
        try{
            let res= await fetchFormData(`projet/getBordereau/${id}`,"GET")
            if(res.ok){
                
                let blob = await res.blob()
                const url=window.URL.createObjectURL(blob)
                setPdf(url) 
            }  
        }catch(e){
            console.log(e)
        }

    }

    const exportExcel=(fileName)=>{
        
        downLoadExcel(document.querySelector(".table"),"feuille 1","Suivi "+fileName)
    }

   
    if(loader){
        return(
            <Loader/>
        )
    }

    return(
        <div className="container pb-10 suivi" >

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
                <div id="pg-title" className="mb-25">
                    <h1>{programme.intitule}</h1>
                    <button className="download-btn"  onClick={()=>exportExcel(`${programme.ordonnateur} ${programme.annee}`)}>
                        <i className="fa-solid fa-down-long"></i>
                    </button>
                </div>
                {programme.ordonnateur==="MINTP" &&(   
                    <div className="top-element s-change">
                        <ul>
                            <li className="active" onClick={(e)=>changeTable(e,"CENTRALE")} >Gestion centrale/regionale</li>
                            <li onClick={(e)=>changeTable(e,"COMMUNE")}>Gestion communale</li>
                        </ul>
                    </div>
                )}
                
                
                {programme.ordonnateur==="MINHDU"?

                    <TableMINHDU data={data} programme={programme} onLoadPdf={loadPdf}  />

                :programme.ordonnateur==="MINT"?

                    <TableMINT data={data} programme={programme} onLoadPdf={loadPdf}  />

                :  
                    <TableMINTP data={data} programme={programme} categorie={categorie}  onLoadPdf={loadPdf}  />

                }
               
            </div>
            
            {programme.ordonnateur==="MINHDU"?

            <div className="box">
                <div className="p-prevision">
                    <div>GESTION CENTRALE</div>
                    <div>{numStr(totalBudget(projet.current.filter(i=>i.ordonnateur==="MINHDU" )),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION COMMUNALE</div>
                    <div>{numStr(totalBudget(projet.current.filter(i=>i.ordonnateur==="MAIRE")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>Provision de réserve</div>
                    <div>
                        <p>{numStr(programme.prevision,0)} fcfa
                        </p>
                    </div>
                </div>
                <div className="p-total">
                    <div>Total</div>
                    <div>{numStr(totalBudget(projet.current,programme.prevision),0)} fcfa</div>
                </div>
            </div>
            
            :programme.ordonnateur==="MINT"?

            <div className="box">
                <div className="p-prevision">
                    <div>GESTION CENTRALE</div>
                    <div>{numStr(totalBudget(projet.current.filter(i=>i.ordonnateur==="MINT")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION COMMUNALE</div>
                    <div>{numStr(totalBudget(projet.current.filter(i=>i.ordonnateur==="MAIRE")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>Provision de réserve</div>
                    <div>
                        <p>{numStr(programme.prevision,0)} fcfa</p>
                    </div>
                </div>
                <div className="p-total">
                    <div>Total</div>
                    <div>{numStr(totalBudget(projet.current,programme.prevision),0)} fcfa</div>
                </div>
            </div>

            :
            <div className="box">
                <div className="p-prevision">
                    <div>GESTION CENTRALE</div>
                    <div>{numStr(totalBudget(projet.current.filter(i=>i.categorie==="PROJET A GESTION CENTRALE")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION REGIONALE</div>
                    <div>{numStr(totalBudget(projet.current.filter(i=>i.categorie==="PROJET A GESTION REGIONALE")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION COMMUNALE</div>
                    <div>{numStr(totalBudget(projet.current.filter(i=>i.categorie==="PROJET A GESTION COMMUNALE")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>Provision de réserve</div>
                    <div>
                        <p>{numStr(programme.prevision,0)} fcfa
                        </p>
                    </div>
                </div>
                <div className="p-total">
                    <div>Total</div>
                    <div>{numStr(totalBudget(projet.current,programme.prevision),0)} fcfa</div>
                </div>
            </div>

            }

            <div className="view-pdf">
                <ModalBox ref={modalBox1}>
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                        {pdf &&(
                            <Viewer 
                            fileUrl={pdf}
                            plugins={[defaultLayoutPluginInstance]}
                        />
                        )}
                        
                    </Worker>
                </ModalBox>
            </div>
 
            
        </div>
    )
}

export default ClotureDetails;


const TableMINHDU=({data,programme,onLoadPdf})=>{

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th>Ville</th>
                        <th className="min-w13">Type de travaux</th>
                        <th className="min-w1">Troçons / Intitulé</th>
                        <th>Linéaire_(ml)</th>
                        <th className="min-w4">Budget total TTC</th>
                        <th className="min-w4">Budget antérieur</th>
                        <th className="min-w4">{`Budget ${programme.annee}`}</th>
                        <th className="min-w4">Engagement</th>
                        <th className="min-w4">Reliquat</th>
                        <th className="min-w3">Prestataire</th>
                        <th className="min-w4">{`Projection ${programme.annee+1}`}</th>
                        <th className="min-w4">{`Projection ${programme.annee+2}`}</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w1">Observations</th>
                        <th>Situation</th>
                        <th className="min-w1">Motifs</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((i,j)=>
                        <tr key={j}>
                            <td>{j+1}</td>
                            <td>{i.region.replaceAll("_","-")}</td>
                            <td >{i.ville}</td>
                            <td>{i.type_travaux}</td>
                            <td>{i.troçon}</td>
                            <td className="end">{numStr(i.lineaire)}</td>
                            <td className="end">{numStr(i.ttc)}</td>
                            <td className="end">{numStr(i.budget_anterieur)}</td>
                            <td className="end">{numStr(i.budget_n) }</td>
                            <td className="end">{i.suivi && numStr(i.suivi.engagement)}</td>
                            <td className="end">{(i.suivi && i.suivi.engagement!==0) && numStr((i.budget_n - i.suivi.engagement),0)}</td>
                            <td>{i.prestataire}</td>
                            <td className="end">{numStr(i.budget_n1)}</td>
                            <td className="end">{numStr(i.budget_n2)}</td>
                            <td>{i.ordonnateur}</td>
                            <td>{i.observation}</td>
                            <td>
                                {i.suivi &&(
                                    i.suivi.statut==="Visé"?
                                    <p  onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                                    :
                                    i.suivi.statut
                                )}
                            </td>
                            <td>
                                {i.suivi && (
                                    parseTable(i.suivi.motif).map((k,l)=><li key={l}>{k}</li>)
                                )}
                            </td>
                        </tr>
                    )
                    }
                    <tr>
                        <td colSpan="8">Prévision de réserve</td>
                        <td className="end">{numStr(programme.prevision,0)}</td>
                        <td className="end">{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td className="end">{numStr(programme.prevision - totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td colSpan="7">
                            <Link to={`/execution-des-programme/programme-MINHDU/${programme.id}/prévision`} >Détails</Link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

const TableMINT=({data,programme,onLoadPdf})=>{

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°_de_lot</th>
                        <th>Region</th>
                        <th className="min-w1">Activités</th>
                        <th className="min-w1">Objectifs</th>
                        <th className="min-w12">Allotissement</th>
                        <th className="min-w4">Budget total TTC</th>
                        <th className="min-w4">Budget antérieur</th>
                        <th className="min-w4">{`Budget ${programme.annee}`}</th>
                        <th className="min-w4">Engagement</th>
                        <th className="min-w4">Reliquat</th>
                        <th className="min-w3">Prestataire</th>
                        <th className="min-w4">{`Projection ${programme.annee+1}`}</th>
                        <th className="min-w4">{`Projection ${programme.annee+2}`}</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w1">Observations</th> 
                        <th className="min-w4">situation</th>
                        <th className="min-w1">Motifs</th>
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
                            <td className="end">{numStr(i.ttc,"")}</td>
                            <td className="end">{numStr(i.budget_anterieur)}</td>
                            <td className="end">{numStr(i.budget_n) }</td>
                            <td className="end">{i.suivi && numStr(i.suivi.engagement)}</td>
                            <td className="end">{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                            <td>{i.prestataire}</td>
                            <td className="end">{numStr(i.budget_n1,"")}</td>
                            <td className="end">{numStr(i.budget_n2,"")}</td>
                            <td>{i.ordonnateur}</td>
                            <td>{i.observation}</td>
                            <td>
                                {i.suivi &&(
                                    i.suivi.statut==="Visé"?
                                    <p  onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                                    :
                                    i.suivi.statut
                                )}
                            </td>
                            <td>
                                {i.suivi && (
                                    parseTable(i.suivi.motif).map((k,l)=><li key={l}>{k}</li>)
                                )}
                            </td>                           
                        </tr>
                    )
                    }
                    <tr>
                        <td colSpan="7">Prévision de réserve</td>
                        <td className="end">{numStr(programme.prevision,0)}</td>
                        <td className="end">{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td className="end">{numStr(programme.prevision-totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td colSpan="7">
                            <Link to={`/execution-des-programme/programme-MINT/${programme.id}/prévision`} >Détails</Link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

const TableMINTP=({data,programme,categorie,onLoadPdf})=>{

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                <tr>
                    <th>N°</th>
                    <th>Région</th>
                    {categorie==="COMMUNE" &&(
                    <>
                        <th className="min-w3">Département</th>
                        <th className="min-w3">Commune</th>
                    </>
                    )}
                    <th className="min-w2">Catégorie</th>
                    <th className="min-w1">Projets/troçons</th>
                    <th>Code route</th>
                    <th>Linéaire_route (km)</th>
                    <th>Linéaire_OA (ml)</th>
                    <th className="min-w4">Budget total TTC</th>
                    <th className="min-w4">Budget antérieur</th>
                    <th className="min-w4">{`Budget ${programme.annee}`}</th>
                    <th className="min-w4">Engagement</th>
                    <th className="min-w4">Reliquat</th>
                    <th className="min-w3">Prestataire</th>
                    <th className="min-w4">{`Projection ${programme.annee+1}`}</th>
                    <th className="min-w4">{`Projection ${programme.annee+2}`}</th>
                    <th className="min-w1">Observations</th>
                    <th className="min-w4">Situation</th>
                    <th className="min-w1">Motifs</th>
                </tr>
            </thead>
                <tbody> 
                {data.map((i,j)=>
                        <tr key={j}>
                            <td>{j+1}</td>
                            <td>{i.region.replaceAll("_","-")}</td>
                            {categorie==="COMMUNE" &&(
                            <>
                                <td>{i.departement}</td>
                                <td>{i.commune}</td>
                            </>
                            )}
                            <td>{i.categorie}</td>
                            <td>{i.projet}</td>
                            <td>{i.code_route}</td>
                            <td className="end">{numStr(i.lineaire_route)}</td>
                            <td className="end">{numStr(i.lineaire_oa)}</td>
                            <td className="end">{numStr(i.ttc)}</td>
                            <td className="end">{numStr(i.budget_anterieur)}</td>
                            <td className="end">{numStr(i.budget_n) }</td>
                            <td className="end">{i.suivi && numStr(i.suivi.engagement)}</td>
                            <td className="end">{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                            <td>{i.prestataire}</td>
                            <td className="end">{numStr(i.budget_n1,"")}</td>
                            <td className="end">{numStr(i.budget_n2,"")}</td>
                            <td>{i.observation}</td>
                            <td>
                                {i.suivi &&(
                                    i.suivi.statut==="Visé"?
                                    <p  onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                                    :
                                    i.suivi.statut
                                )}
                            </td>
                            <td>
                                {i.suivi && (
                                    parseTable(i.suivi.motif).map((k,l)=><li key={l}>{k}</li>)
                                )}
                            </td>                           
                            
                        </tr>
                    )
                    }
                    <tr>
                        <td colSpan={categorie==="CENTRALE"?"9":"11"} >Prévision de réserve</td>
                        <td className="end">{numStr(programme.prevision,0)}</td>
                        <td className="end">{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td className="end">{numStr(programme.prevision-totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td colSpan="6">
                            <Link to={`/execution-des-programme/programme-MINTP/${programme.id}/prévision`} >Détails</Link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}