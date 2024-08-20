import { useRef,useState,useEffect } from "react"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import Notification from "../../component/notification"
import { useNavigate, useParams } from "react-router-dom"
import { fetchFormData, fetchGet } from "../../config/FetchRequest"
import {  numStr, totalBudget, totalPayement } from "../../script"
import ModalBox from "../../component/modalBox"
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { downLoadExcel } from "jsxtabletoexcel"



function DetailsPaid(){

    let modalBox1=useRef()
    let notification=useRef()
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
                let res = await fetchGet(`programmeByRole/${id}`)
                if(res.ok){
                    let resData= await res.json()
                    if(resData.type==="erreur" || !["VALIDER","CLOTURER"].includes(resData.statut) || resData.ordonnateur!==ordonnateur.substring(10)){
                        console.log(resData.statut)
                        navigate(-1)
                    }else{
                        setProgramme(resData)
                        projet.current=resData.projetList.filter((i=>i.financement!=="RESERVE" && i.bordereau ))
                        if(resData.ordonnateur==="MINTP"){
                            setData(resData.projetList.filter(i=>(i.financement!=="RESERVE"  && i.bordereau && i.categorie!=="PROJET A GESTION COMMUNALE") ))
                            return;                  
                        }
                        setData(resData.projetList.filter(i=>(i.financement!=="RESERVE" && i.bordereau ) ))
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
                <div id="pg-title" className="mb-25">
                    <h1>{programme.intitule}</h1>
                    <button className="download-btn"  onClick={()=>exportExcel(`${programme.ordonnateur} ${programme.annee}`)}>
                        <i className="fa-solid fa-down-long"></i>
                    </button>
                </div>
                {programme.ordonnateur==="MINTP" &&  
                    <div className="top-element s-change">
                        <ul>
                            <li className="active" onClick={(e)=>changeTable(e,"CENTRALE")} >Gestion centrale/regionale</li>
                            <li onClick={(e)=>changeTable(e,"COMMUNE")}>Gestion communale</li>
                        </ul>
                    </div>
            
                }
                

                
                {programme.ordonnateur==="MINHDU"?

                    <TableMINHDU 
                     data={data} 
                     programme={programme} 
                     onLoadPdf={loadPdf} 
                     />

                :programme.ordonnateur==="MINT"?

                    <TableMINT data={data}
                     programme={programme}
                     onLoadPdf={loadPdf} 
                    />

                :  
                    <TableMINTP 
                     data={data} 
                     programme={programme} 
                     categorie={categorie}  
                     onLoadPdf={loadPdf} 
                     />

                }
               
            </div>
            
            {programme.ordonnateur==="MINHDU"?

            <div className="box">
                <div className="p-prevision">
                    <div>GESTION CENTRALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.ordonnateur==="MINHDU" )),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION COMMUNALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.ordonnateur==="MAIRE")),0)} fcfa</div>
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
                    <div>{numStr(totalBudget(programme.projetList,programme.prevision),0)} fcfa</div>
                </div>
            </div>
            
            :programme.ordonnateur==="MINT"?

            <div className="box">
                <div className="p-prevision">
                    <div>GESTION CENTRALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.ordonnateur==="MINT")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION COMMUNALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.ordonnateur==="MAIRE")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>Provision de réserve</div>
                    <div>
                        <p>{numStr(programme.prevision,0)} fcfa</p>
                    </div>
                </div>
                <div className="p-total">
                    <div>Total</div>
                    <div>{numStr(totalBudget(programme.projetList,programme.prevision),0)} fcfa</div>
                </div>
            </div>

            :programme.ordonnateur==="MINTP"?

            <div className="box">
                <div className="p-prevision">
                    <div>GESTION CENTRALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.categorie==="PROJET A GESTION CENTRALE")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION REGIONALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.categorie==="PROJET A GESTION REGIONALE")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION COMMUNALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.categorie==="PROJET A GESTION COMMUNALE")),0)} fcfa</div>
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
                    <div>{numStr(totalBudget(programme.projetList,programme.prevision),0)} fcfa</div>
                </div>
            </div>

            :<></>

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

export default DetailsPaid;


const TableMINHDU=({data,programme,onLoadPdf})=>{

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th>Ville</th>
                        <th className="min-w1">Troçons / Intitulé</th>
                        <th>Linéaire_(ml)</th>
                        <th className="min-w4">Budget total TTC</th>
                        <th className="min-w4">Budget_antérieur</th>
                        <th className="min-w4">Budget {programme.annee}</th>
                        <th className="min-w4">Engagement</th>
                        <th className="min-w4">Reliquat</th>
                        <th className="min-w3">Prestataire</th>
                        <th className="min-w4">Projection {programme.annee+1}</th>
                        <th className="min-w4">Projection {programme.annee+2}</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w4">Situation</th>
                        <th colSpan="9" className="text-center">Suivi des payements</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((i,j)=>
                        <>
                            <tr key={j}>
                                <td rowSpan={i.payement.length +2}>{j+1}</td>
                                <td rowSpan={i.payement.length +2}>{i.region.replaceAll("_","-")}</td>
                                <td rowSpan={i.payement.length +2}>{i.ville}</td>
                                <td  rowSpan={i.payement.length +2}>{i.troçon}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.lineaire)}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.ttc)}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.budget_anterieur)}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.budget_n) }</td>
                                <td rowSpan={i.payement.length +2}>{i.suivi && numStr(i.suivi.engagement)}</td>
                                <td rowSpan={i.payement.length +2}>{(i.suivi && i.suivi.engagement!==0) && numStr((i.budget_n - i.suivi.engagement),0)}</td>
                                <td rowSpan={i.payement.length +2}>{i.prestataire}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.budget_n1)}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.budget_n2)}</td>
                                <td rowSpan={i.payement.length +2}>{i.ordonnateur}</td>
                                <td rowSpan={i.payement.length +2}>  
                                    <p  onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>       
                                </td>
                                <td className="bold">Date</td>
                                <td className="bold">N°_decompte</td>
                                <td className="min-w4 bold">N°_marché</td>
                                <td className="min-w4 bold">Montant HTVA</td>
                                <td className="min-w4 bold">Montant TTC</td>
                                <td className="min-w4 bold">Montant TVA</td>
                                <td className="min-w4 bold">Montant AIR</td>
                                <td className="min-w4 bold">Net à payer</td>
                                <td className="min-w2 bold">Observations</td>  
                            </tr>

                            {i.payement.map( (k,l)=>
                                <tr className="height-line" key={l+1}>
                                    <td>{new Date(k.date).toLocaleDateString()}</td>
                                    <td>{k.decompte}</td>
                                    <td>{k.n_marche}</td>
                                    <td>{numStr(k.m_HTVA)}</td>
                                    <td>{numStr(k.m_TTC)}</td>
                                    <td>{numStr(k.m_TVA)}</td>
                                    <td>{numStr(k.m_AIR)}</td>
                                    <td>{numStr(k.nap)}</td>
                                    <td>{k.observation}</td>
                                </tr>
                            )}

                            <tr className="height-line">
                                <td colSpan="3">Total</td>
                                <td>{numStr(totalPayement(i.payement,"m_HTVA") )}</td>
                                <td>{numStr(totalPayement(i.payement,"m_TTC") )}</td>
                                <td>{numStr(totalPayement(i.payement,"m_TVA") )}</td>
                                <td>{numStr(totalPayement(i.payement,"m_AIR") )}</td>
                                <td>{numStr(totalPayement(i.payement,"nap") )}</td>
                                <td>
                                </td>
                            </tr>
                        </>
                        
                    )}
                    
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
                        <th className="min-w4">Budget {programme.annee}</th>
                        <th className="min-w4">Engagement</th>
                        <th className="min-w4">Reliquat</th>
                        <th className="min-w3">Prestataire</th>
                        <th className="min-w4">Projection {programme.annee+1}</th>
                        <th className="min-w4">Projection {programme.annee+2}</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w4">situation</th>
                        <th colSpan="9" className="text-center">Suivi des payements</th>
                    </tr>
                </thead>
                <tbody> 
                {data.map((i,j)=>
                    <>
                        <tr key={j}>
                            <td rowSpan={i.payement.length +2}>{j+1}</td>
                            <td rowSpan={i.payement.length +2}>{i.region.replaceAll("_","-")}</td>
                            <td rowSpan={i.payement.length +2}>{i.mission}</td>
                            <td rowSpan={i.payement.length +2}>{i.objectif}</td>
                            <td rowSpan={i.payement.length +2}>{i.allotissement}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.ttc,"")}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_anterieur)}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n) }</td>
                            <td rowSpan={i.payement.length +2}>{i.suivi && numStr(i.suivi.engagement)}</td>
                            <td rowSpan={i.payement.length +2}>{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                            <td rowSpan={i.payement.length +2}>{i.prestataire}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n1,"")}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n2,"")}</td>
                            <td rowSpan={i.payement.length +2}>{i.ordonnateur}</td>
                            <td rowSpan={i.payement.length +2}>
                                <p onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                            </td>
                            <td className="bold">Date</td>
                            <td className="bold">N°_decompte</td>
                            <td className="min-w4 bold">N°_marché</td>
                            <td className="min-w4 bold">Montant HTVA</td>
                            <td className="min-w4 bold">Montant TTC</td>
                            <td className="min-w4 bold">Montant TVA</td>
                            <td className="min-w4 bold">Montant AIR</td>
                            <td className="min-w4 bold">Net à payer</td>
                            <td className="min-w2 bold">Observations</td>  
                        </tr>

                        {i.payement.map( (k,l)=>
                            <tr className="height-line" key={l+1}>
                                <td>{new Date(k.date).toLocaleDateString()}</td>
                                <td>{k.decompte}</td>
                                <td>{k.n_marche}</td>
                                <td>{numStr(k.m_HTVA)}</td>
                                <td>{numStr(k.m_TTC)}</td>
                                <td>{numStr(k.m_TVA)}</td>
                                <td>{numStr(k.m_AIR)}</td>
                                <td>{numStr(k.nap)}</td>
                                <td>{k.observation}</td>
                            </tr>
                        )}

                        <tr className="height-line">
                            <td colSpan="3">Total</td>
                            <td>{numStr(totalPayement(i.payement,"m_HTVA") )}</td>
                            <td>{numStr(totalPayement(i.payement,"m_TTC") )}</td>
                            <td>{numStr(totalPayement(i.payement,"m_TVA") )}</td>
                            <td>{numStr(totalPayement(i.payement,"m_AIR") )}</td>
                            <td>{numStr(totalPayement(i.payement,"nap") )}</td>
                            <td>
                            </td>
                        </tr>  

                    </>
                        
                    )}
                    
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
                    <th className="min-w4">Budget {programme.annee}</th>
                    <th className="min-w4">Engagement</th>
                    <th className="min-w4">Reliquat</th>
                    <th className="min-w3">Prestataire</th>
                    <th className="min-w4">Projection {programme.annee+1}</th>
                    <th className="min-w4">Projection {programme.annee+2}</th>
                    <th className="min-w4">Situation</th>
                    <th colSpan="9" className="text-center">Suivi des payements</th>
                </tr>
            </thead>
                <tbody> 
                {data.map((i,j)=>
                    <>
                        <tr rowSpan={i.payement.length +2} key={j}>
                            <td rowSpan={i.payement.length +2}>{j+1}</td>
                            <td rowSpan={i.payement.length +2}>{i.region.replaceAll("_","-")}</td>
                            {categorie==="COMMUNE" &&(
                            <>
                                <td rowSpan={i.payement.length +2}>{i.departement}</td>
                                <td rowSpan={i.payement.length +2}>{i.commune}</td>
                            </>
                            )}
                            <td rowSpan={i.payement.length +2}>{i.categorie}</td>
                            <td rowSpan={i.payement.length +2}>{i.projet}</td>
                            <td rowSpan={i.payement.length +2}>{i.code_route}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.lineaire_route)}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.lineaire_oa)}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.ttc)}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_anterieur)}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n) }</td>
                            <td rowSpan={i.payement.length +2}>{i.suivi && numStr(i.suivi.engagement)}</td>
                            <td rowSpan={i.payement.length +2}>{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                            <td rowSpan={i.payement.length +2}>{i.prestataire}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n1,"")}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n2,"")}</td>
                            <td rowSpan={i.payement.length +2}>
                                <p  onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                            </td>
                            <td className="bold">Date</td>
                            <td className="bold">N°_decompte</td>
                            <td className="min-w4 bold">N°_marché</td>
                            <td className="min-w4 bold">Montant HTVA</td>
                            <td className="min-w4 bold">Montant TTC</td>
                            <td className="min-w4 bold">Montant TVA</td>
                            <td className="min-w4 bold">Montant AIR</td>
                            <td className="min-w4 bold">Net à payer</td>
                            <td className="min-w2 bold">Observations</td>
                        </tr>

                        {i.payement.map( (k,l)=>
                            <tr className="height-line" key={l+1}>
                                <td>{new Date(k.date).toLocaleDateString()}</td>
                                <td>{k.decompte}</td>
                                <td>{k.n_marche}</td>
                                <td>{numStr(k.m_HTVA )}</td>
                                <td>{numStr(k.m_TTC )}</td>
                                <td>{numStr(k.m_TVA )}</td>
                                <td>{numStr(k.m_AIR )}</td>
                                <td>{numStr(k.nap )}</td>
                                <td>{k.observation}</td>
                            </tr>
                        )}

                        <tr className="height-line">
                            <td colSpan="3">Total</td>
                            <td>{numStr(totalPayement(i.payement,"m_HTVA") )}</td>
                            <td>{numStr(totalPayement(i.payement,"m_TTC") )}</td>
                            <td>{numStr(totalPayement(i.payement,"m_TVA") )}</td>
                            <td>{numStr(totalPayement(i.payement,"m_AIR") )}</td>
                            <td>{numStr(totalPayement(i.payement,"nap") )}</td>
                            <td>
                            </td>
                        </tr>
                        
                    </>
                        
                )}    
                </tbody>
            </table>
        </div>
    )
}