import { useRef,useState } from "react"
import SearchBar from "../../component/searchBar"
import Notification from "../../component/notification"
import { Fetch, fetchFormData } from "../../config/FetchRequest"
import {  numStr, totalBudget, totalPayement } from "../../script"
import ModalBox from "../../component/modalBox"
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { downLoadExcel } from "jsxtabletoexcel"
import PageLoader from "../../component/pageLoader"



function Payement({role}){

    let modalBox1=useRef()
    let notification=useRef()
    let projet=useRef([])
    let date=new Date()


    let [programme,setProgramme]=useState({})
    let [pageLoader,setPageLoader]=useState()
    let [data,setData]=useState([])
    let [pdf,setPdf]=useState()
    let [categorie,setCategorie]=useState()
    
    
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const submit=async(e)=>{

        let type=["BASE","ADDITIONNEL","REPORT"]

        e.preventDefault()
        let form=e.target

        if( !type.includes(form.type.value) || form.annee.value==="" || parseInt(form.annee.value) > date.getFullYear()  )
        {
            return;
        }
        setPageLoader(true)
        let formData =new FormData(form);
        let data=Object.fromEntries(formData)

        try{
            const res= await Fetch('searchProgramme',"POST",data)

            if(res.ok){
                const resData= await res.json()

                if(resData.type==="erreur"){

                    setProgramme({})
                    window.scroll({top: 0, behavior:"smooth"})
                    notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message})
                }
                else{
                    setProgramme(resData)
                    projet.current=resData.projetList.filter((i=>i.financement!=="RESERVE" && i.bordereau ))
                    if(resData.ordonnateur==="MINTP"){
                        setCategorie("CENTRALE")
                        setData(resData.projetList.filter(i=>(i.financement!=="RESERVE"  && i.bordereau && i.categorie==="PROJET A GESTION CENTRALE") ))
                        return;                  
                    }else if(resData.ordonnateur==="MINT"){
                        setCategorie("MINT")
                        setData(resData.projetList.filter(i=>(i.financement!=="RESERVE"  && i.bordereau && i.ordonnateur==="MINT") ))
                        return;                  

                    }
                    setData(resData.projetList.filter(i=>(i.financement!=="RESERVE" && i.bordereau ) ))
                }

            }
  
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }


    }

    const changeTable=(e,i)=>{

        let li=e.target

        setCategorie(i)

        let type= `PROJET A GESTION ${i}`

        setData(projet.current.filter(i=>i.categorie=== type))
       
        if(li.classList.contains("active")){
            return;
        }

        Array.from(li.parentNode.children).forEach(i=>{
            i.classList.remove("active")
        })
        li.classList.add("active")
    }

    const changeMINT=(e,i)=>{

        let li=e.target

        setCategorie(i)
        if(i==="MINT"){
            setData(projet.current.filter(i=>i.ordonnateur==="MINT"))
        }else{
            setData(projet.current.filter(i=>i.ordonnateur==="MAIRE"))
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

    const searchChoose=(ordonnateur)=>{

        let data
        let key

        if(ordonnateur==="MINT"){

            data=projet.current
            key=["region","budget_n","prestataire","ordonnateur"]

        }else if(ordonnateur==="MINHDU"){

            data=projet.current
            key=["region","ville","type_travaux","budget_n","prestataire","ordonnateur"]

        }else if(ordonnateur==="MINTP"){

            let type=`PROJET A GESTION ${categorie}`
            data=projet.current.filter(i=>i.categorie===type)

            if(categorie!=="COMMUNALE"){

                key=["region","budget_n","code_route","prestataire"]
            }else{
    
                key=["region","departement","commune","budget_n","code_route","prestataire"]
            }
        }

        return ({data:data, key: key}) 
    }

    const exportExcel=(fileName)=>{
        
        downLoadExcel(document.querySelector(".table"),"feuille 1","Suivi "+fileName)
    }


    return(
        <div className="container pb-10 suivi" >
            <Notification ref={notification} />

            <div className="flex">

                <div className="box a-filter">
                    <form className="s-filter" onSubmit={submit}>
                        <div>
                            <div className="form-line">
                                <label>Programme</label>
                                <input type="text" value={`Programme ${role}`} disabled/>
                            </div>
                            <div className="form-line">
                                <label>Catégorie</label>
                                <select name="type">
                                    <option value="BASE">Base</option>
                                    <option value="ADDITIONNEL">Additionnel</option>
                                </select>
                            </div>
                            <div className="form-line">
                                <label>Année</label>
                                <input type="number" max={date.getFullYear()} name="annee" required/>
                            </div>
                        </div>
                        <div className="form-line">
                            <button>Valider</button>
                        </div>
                    </form>
                </div>

                <div className="box b-search">
                    {programme?
                        <SearchBar data={searchChoose(programme.ordonnateur).data} keys={searchChoose(programme.ordonnateur).key} onSetData={setData} />
                    :
                        <SearchBar/>
                    }
                </div>
            </div>

            {programme.type &&(

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
                            <li className="active" onClick={(e)=>changeTable(e,"CENTRALE")} >Centrale</li>
                            <li onClick={(e)=>changeTable(e,"REGIONALE")} >Regionale</li>
                            <li onClick={(e)=>changeTable(e,"COMMUNALE")}>Communale</li>
                        </ul>
                    </div>
                }
                {programme.ordonnateur==="MINT" &&(   
                    <div className="top-element s-change">
                        <ul>
                            <li className="active" onClick={(e)=>changeMINT(e,"MINT")} >Gestion centrale</li>
                            <li onClick={(e)=>changeMINT(e,"MAIRE")}>Gestion communale</li>
                        </ul>
                    </div>
                )}

                
                {programme.ordonnateur==="MINHDU"?

                    <TableMINHDU 
                     data={data} 
                     programme={programme} 
                     onLoadPdf={loadPdf} 
                     />

                :programme.ordonnateur==="MINT"?

                    <TableMINT data={data}
                    categorie={categorie}  
                     programme={programme}
                     onLoadPdf={loadPdf} 
                    />

                :programme.ordonnateur==="MINTP"?  
                    <TableMINTP 
                     data={data} 
                     programme={programme} 
                     categorie={categorie}  
                     onLoadPdf={loadPdf} 
                     />
                :<></>

                }
               
            </div>

            )}
            
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
        
            {pageLoader &&(
                <PageLoader/>
            )}
        </div>
    )
}

export default Payement;


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
                        <th>Ordonnateurs</th>
                        <th className="min-w4">Situation</th>
                        <th colSpan="9" className="text-center c-paid">Suivi des payements</th>
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
                                <td rowSpan={i.payement.length +2} className="end">{numStr(i.lineaire)}</td>
                                <td rowSpan={i.payement.length +2} className="end">{numStr(i.ttc)}</td>
                                <td rowSpan={i.payement.length +2} className="end">{numStr(i.budget_anterieur)}</td>
                                <td rowSpan={i.payement.length +2} className="end">{numStr(i.budget_n) }</td>
                                <td rowSpan={i.payement.length +2} className="end">{i.suivi && numStr(i.suivi.engagement)}</td>
                                <td rowSpan={i.payement.length +2} className="end">{(i.suivi && i.suivi.engagement!==0) && numStr((i.budget_n - i.suivi.engagement),0)}</td>
                                <td rowSpan={i.payement.length +2}>{i.prestataire}</td>
                                <td rowSpan={i.payement.length +2}>{i.ordonnateur}</td>
                                <td rowSpan={i.payement.length +2}>  
                                    <p  onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>       
                                </td>
                                <td className="bold c-paid">Date</td>
                                <td className="bold c-paid">N°_decompte</td>
                                <td className="min-w4 bold c-paid">N° marché</td>
                                <td className="min-w4 bold c-paid">Montant HTVA</td>
                                <td className="min-w4 bold c-paid">Montant TTC</td>
                                <td className="min-w4 bold c-paid">Montant TVA</td>
                                <td className="min-w4 bold c-paid">Montant AIR</td>
                                <td className="min-w4 bold c-paid">Net à payer</td>
                                <td className="min-w2 bold c-paid">Observations</td>  
                            </tr>

                            {i.payement.map( (k,l)=>
                                <tr className="height-line" key={l+1}>
                                    <td>{new Date(k.date).toLocaleDateString()}</td>
                                    <td>{k.decompte}</td>
                                    <td>{k.n_marche}</td>
                                    <td className="end">{numStr(k.m_HTVA)}</td>
                                    <td className="end">{numStr(k.m_TTC)}</td>
                                    <td className="end">{numStr(k.m_TVA)}</td>
                                    <td className="end">{numStr(k.m_AIR)}</td>
                                    <td className="end">{numStr(k.nap)}</td>
                                    <td>{k.observation}</td>
                                </tr>
                            )}

                            <tr className="height-line">
                                <td colSpan="3">Total</td>
                                <td className="end">{numStr(totalPayement(i.payement,"m_HTVA") )}</td>
                                <td className="end">{numStr(totalPayement(i.payement,"m_TTC") )}</td>
                                <td className="end">{numStr(totalPayement(i.payement,"m_TVA") )}</td>
                                <td className="end">{numStr(totalPayement(i.payement,"m_AIR") )}</td>
                                <td className="end">{numStr(totalPayement(i.payement,"nap") )}</td>
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

const TableMINT=({data,programme,categorie,onLoadPdf})=>{

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Region</th>
                        {categorie==="MAIRE" &&(
                        <>
                            <th className="min-w3">Département</th>
                            <th className="min-w3">Commune</th>
                        </>
                        )}
                        <th className="min-w1">Activités</th>
                        <th className="min-w1">Objectifs</th>
                        <th className="min-w12">Allotissement</th>
                        <th className="min-w4">Budget total TTC</th>
                        <th className="min-w4">Budget antérieur</th>
                        <th className="min-w4">Budget {programme.annee}</th>
                        <th className="min-w4">Engagement</th>
                        <th className="min-w4">Reliquat</th>
                        <th className="min-w3">Prestataire</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w4">situation</th>
                        <th colSpan="9"  className="text-center c-paid">Suivi des payements</th>
                    </tr>
                </thead>
                <tbody> 
                {data.map((i,j)=>
                    <>
                        <tr key={j}>
                            <td rowSpan={i.payement.length +2}>{j+1}</td>
                            <td rowSpan={i.payement.length +2}>{i.region.replaceAll("_","-")}</td>
                            {categorie==="MAIRE"&&(
                            <>
                                <td rowSpan={i.payement.length +2}>{i.departement}</td>
                                <td rowSpan={i.payement.length +2}>{i.commune}</td>
                            </>  
                            )}
                            <td rowSpan={i.payement.length +2}>{i.mission}</td>
                            <td rowSpan={i.payement.length +2}>{i.objectif}</td>
                            <td rowSpan={i.payement.length +2}>{i.allotissement}</td>
                            <td rowSpan={i.payement.length +2} className="end">{numStr(i.ttc,"")}</td>
                            <td rowSpan={i.payement.length +2} className="end">{numStr(i.budget_anterieur)}</td>
                            <td rowSpan={i.payement.length +2} className="end">{numStr(i.budget_n) }</td>
                            <td rowSpan={i.payement.length +2} className="end">{i.suivi && numStr(i.suivi.engagement)}</td>
                            <td rowSpan={i.payement.length +2} className="end">{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                            <td rowSpan={i.payement.length +2}>{i.prestataire}</td>
                            <td rowSpan={i.payement.length +2}>{i.ordonnateur}</td>
                            <td rowSpan={i.payement.length +2}>
                                <p onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                            </td>
                            <td className="bold c-paid">Date</td>
                            <td className="bold c-paid">N°_decompte</td>
                            <td className="min-w4 c-paid bold">N°_marché</td>
                            <td className="min-w4 c-paid bold">Montant HTVA</td>
                            <td className="min-w4 c-paid bold">Montant TTC</td>
                            <td className="min-w4 c-paid bold">Montant TVA</td>
                            <td className="min-w4 c-paid bold">Montant AIR</td>
                            <td className="min-w4 c-paid bold">Net à payer</td>
                            <td className="min-w2 c-paid bold">Observations</td>  
                        </tr>

                        {i.payement.map( (k,l)=>
                            <tr className="height-line" key={l+1}>
                                <td>{new Date(k.date).toLocaleDateString()}</td>
                                <td>{k.decompte}</td>
                                <td>{k.n_marche}</td>
                                <td className="end">{numStr(k.m_HTVA)}</td>
                                <td className="end">{numStr(k.m_TTC)}</td>
                                <td className="end">{numStr(k.m_TVA)}</td>
                                <td className="end">{numStr(k.m_AIR)}</td>
                                <td className="end">{numStr(k.nap)}</td>
                                <td>{k.observation}</td>
                            </tr>
                        )}

                        <tr className="height-line">
                            <td colSpan="3">Total</td>
                            <td className="end">{numStr(totalPayement(i.payement,"m_HTVA") )}</td>
                            <td className="end">{numStr(totalPayement(i.payement,"m_TTC") )}</td>
                            <td className="end">{numStr(totalPayement(i.payement,"m_TVA") )}</td>
                            <td className="end">{numStr(totalPayement(i.payement,"m_AIR") )}</td>
                            <td className="end">{numStr(totalPayement(i.payement,"nap") )}</td>
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
                    {categorie==="COMMUNALE" &&(
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
                    <th className="min-w4">Situation</th>
                    <th colSpan="9" className="text-center c-paid">Suivi des payements</th>
                </tr>
            </thead>
                <tbody> 
                {data.map((i,j)=>
                    <>
                        <tr rowSpan={i.payement.length +2} key={j}>
                            <td rowSpan={i.payement.length +2}>{j+1}</td>
                            <td rowSpan={i.payement.length +2}>{i.region.replaceAll("_","-")}</td>
                            {categorie==="COMMUNALE" &&(
                            <>
                                <td rowSpan={i.payement.length +2}>{i.departement}</td>
                                <td rowSpan={i.payement.length +2}>{i.commune}</td>
                            </>
                            )}
                            <td rowSpan={i.payement.length +2}>{i.categorie}</td>
                            <td rowSpan={i.payement.length +2}>{i.projet}</td>
                            <td rowSpan={i.payement.length +2}>{i.code_route}</td>
                            <td rowSpan={i.payement.length +2} className="end">{numStr(i.lineaire_route)}</td>
                            <td rowSpan={i.payement.length +2} className="end">{numStr(i.lineaire_oa)}</td>
                            <td rowSpan={i.payement.length +2} className="end">{numStr(i.ttc)}</td>
                            <td rowSpan={i.payement.length +2} className="end">{numStr(i.budget_anterieur)}</td>
                            <td rowSpan={i.payement.length +2} className="end">{numStr(i.budget_n) }</td>
                            <td rowSpan={i.payement.length +2} className="end">{i.suivi && numStr(i.suivi.engagement)}</td>
                            <td rowSpan={i.payement.length +2} className="end">{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                            <td rowSpan={i.payement.length +2}>{i.prestataire}</td>
                            <td rowSpan={i.payement.length +2}>
                                <p  onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                            </td>
                            <td className="bold c-paid">Date</td>
                            <td className="bold c-paid">N°_decompte</td>
                            <td className="min-w4 c-paid bold">N°_marché</td>
                            <td className="min-w4 c-paid bold">Montant HTVA</td>
                            <td className="min-w4 c-paid bold">Montant TTC</td>
                            <td className="min-w4 c-paid bold">Montant TVA</td>
                            <td className="min-w4 c-paid bold">Montant AIR</td>
                            <td className="min-w4 c-paid bold">Net à payer</td>
                            <td className="min-w2 c-paid bold">Observations</td>
                        </tr>

                        {i.payement.map( (k,l)=>
                            <tr className="height-line" key={l+1}>
                                <td>{new Date(k.date).toLocaleDateString()}</td>
                                <td>{k.decompte}</td>
                                <td>{k.n_marche}</td>
                                <td className="end">{numStr(k.m_HTVA )}</td>
                                <td className="end">{numStr(k.m_TTC )}</td>
                                <td className="end">{numStr(k.m_TVA )}</td>
                                <td className="end">{numStr(k.m_AIR )}</td>
                                <td className="end">{numStr(k.nap )}</td>
                                <td>{k.observation}</td>
                            </tr>
                        )}

                        <tr className="height-line">
                            <td colSpan="3">Total</td>
                            <td className="end">{numStr(totalPayement(i.payement,"m_HTVA") )}</td>
                            <td className="end">{numStr(totalPayement(i.payement,"m_TTC") )}</td>
                            <td className="end">{numStr(totalPayement(i.payement,"m_TVA") )}</td>
                            <td className="end">{numStr(totalPayement(i.payement,"m_AIR") )}</td>
                            <td className="end">{numStr(totalPayement(i.payement,"nap") )}</td>
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