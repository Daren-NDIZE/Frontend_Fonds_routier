import { useRef,useState } from "react"
import SearchBar from "../../component/searchBar"
import Notification from "../../component/notification"
import PageLoader from "../../component/pageLoader"
import { Fetch, fetchFormData } from "../../config/FetchRequest"
import {  numStr,  totalBudget } from "../../script"
import ModalBox from "../../component/modalBox"
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { downLoadExcel } from "jsxtabletoexcel"


function Travaux({role}){

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

        if( !type.includes(form.type.value) || form.annee.value==="" || parseInt(form.annee.value) > (date.getFullYear()+1)  )
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
                    projet.current=resData.projetList.filter(i=>i.financement!=="RESERVE")
                    if(resData.ordonnateur==="MINTP"){
                        setCategorie("CENTRALE")
                        setData(resData.projetList.filter(i=>(i.financement!=="RESERVE" && i.categorie==="PROJET A GESTION CENTRALE") ))
                        return;                  
                    }else if(resData.ordonnateur==="MINT"){
                        setCategorie("MINT")
                        setData(resData.projetList.filter(i=>(i.financement!=="RESERVE" && i.ordonnateur==="MINT") ))
                        return; 
                    }
                    setData(resData.projetList.filter(i=>i.financement!=="RESERVE"))

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

    const exportExcel=(fileName)=>{
        
        downLoadExcel(document.querySelector(".table"),"feuille 1","Suivi "+fileName)
    }

    const searchChoose=(ordonnateur)=>{

        let data
        let key

        if(ordonnateur==="MINT"){

            if(categorie==="MINT"){
                data=projet.current.filter(i=>i.ordonnateur==="MINT")
                key=["region","budget_n","prestataire","ordonnateur"]
    
                return ({data:data, key: key})
    
            }else{
    
                data=projet.current.filter(i=>i.ordonnateur==="MAIRE")
                key=["region","departement","commune","budget_n","prestataire","ordonnateur"]
            }
           

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
                                <input type="number" max={date.getFullYear()+1} name="annee" required/>
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
                {programme.ordonnateur==="MINTP" &&(   
                    <div className="top-element s-change">
                        <ul>
                            <li className="active" onClick={(e)=>changeTable(e,"CENTRALE")} >Centrale</li>
                            <li onClick={(e)=>changeTable(e,"REGIONALE")} >Regionale</li>
                            <li onClick={(e)=>changeTable(e,"COMMUNALE")}>Communale</li>
                        </ul>
                    </div>
                )}
                {programme.ordonnateur==="MINT" &&(   
                    <div className="top-element s-change">
                        <ul>
                            <li className="active" onClick={(e)=>changeMINT(e,"MINT")} >Gestion centrale</li>
                            <li onClick={(e)=>changeMINT(e,"MAIRE")}>Gestion communale</li>
                        </ul>
                    </div>
                )}
                
                
                {programme.ordonnateur==="MINHDU"?

                    <TableMINHDU data={data} programme={programme} onLoadPdf={loadPdf} />

                :programme.ordonnateur==="MINT"?

                    <TableMINT data={data} programme={programme} categorie={categorie} onLoadPdf={loadPdf} />

                :programme.ordonnateur==="MINTP"?

                    <TableMINTP data={data} programme={programme} categorie={categorie}  onLoadPdf={loadPdf} />
                
                :<></>

                }
               
            </div>
            )}
            
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

            :programme.ordonnateur==="MINTP"?
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

export default Travaux;


const TableMINHDU=({data,programme,onLoadPdf})=>{


    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th rowSpan="2">N°</th>
                        <th rowSpan="2">Région</th>
                        <th rowSpan="2">Ville</th>
                        <th rowSpan="2" className="min-w13">Type de travaux</th>
                        <th rowSpan="2" className="min-w1">Troçons / Intitulé</th>
                        <th rowSpan="2">Linéaire (ml)</th>
                        <th rowSpan="2" className="min-w4">Budget total TTC (FCFA)</th>
                        <th rowSpan="2" className="min-w4">Budget antérieur (FCFA)</th>
                        <th rowSpan="2" className="min-w4">{`budget ${programme.annee}`} (FCFA)</th>
                        <th rowSpan="2" className="min-w3">Prestataire</th>
                        <th rowSpan="2">Ordonnateurs</th>
                        <th colSpan="7" className="text-center str">Suivi passation et exécution</th>
                    </tr>
                    <tr>
                        <th className="min-w13 str">Niveau de contractualisation du projet</th>
                        <th className="min-w4 str">N° du Marché</th>
                        <th className="min-w4 str">Date OS  de demarrage</th>
                        <th className="str">Taux de consommation</th>
                        <th className="str">Taux d'avancement</th>
                        <th className="min-w12 str">Contraintes/Difficultés éventuelles</th>
                        <th className="min-w12 str">Propositions de solutions</th>
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
                            <td className="end">{numStr(i.lineaire)}</td>
                            <td className="end">{numStr(i.ttc)}</td>
                            <td className="end">{numStr(i.budget_anterieur)}</td>
                            <td className="end">{numStr(i.budget_n) }</td>
                            <td>{i.prestataire}</td>
                            <td>{i.ordonnateur}</td> 
                            {i.passation.length?
                                <>
                                    <td>{i.passation.slice(-1).pop().contractualisation}</td>
                                    <td>{i.passation.slice(-1).pop().numeroMarche}</td>
                                    <td>{new Date(i.passation.slice(-1).pop().dateOs).toLocaleDateString()}</td>
                                </>
                            :
                                <><td></td><td></td><td></td></>
                            }

                            {i.suiviTravaux.length?
                            <>                
                                <td>{i.suiviTravaux.slice(-1).pop().tauxConsommation} %</td>
                                <td>{i.suiviTravaux.slice(-1).pop().tauxAvancement} %</td>
                                <td>{i.suiviTravaux.slice(-1).pop().description}</td>
                                <td>{i.suiviTravaux.slice(-1).pop().proposition}</td>
                            </>
                            :<>
                                <td></td><td></td><td></td><td></td>
                            </>
                            }
                        </tr>
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
                        <th rowSpan="2">N°_de_lot</th>
                        <th rowSpan="2">Region</th>
                        {categorie==="MAIRE" &&(
                        <>
                            <th rowSpan="2">Département</th>
                            <th rowSpan="2" className="min-w3">Commune</th>
                        </>
                        )}
                        <th rowSpan="2" className="min-w1">Activités</th>
                        <th rowSpan="2" className="min-w1">Objectifs</th>
                        <th rowSpan="2" className="min-w12">Allotissement</th>
                        <th rowSpan="2" className="min-w4">Budget total TTC (FCFA)</th>
                        <th rowSpan="2" className="min-w4">Budget antérieur (FCFA)</th>
                        <th rowSpan="2" className="min-w4">{`budget ${programme.annee}`} (FCFA)</th>
                        <th rowSpan="2" className="min-w3">Prestataire</th>
                        <th rowSpan="2">Ordonnateurs</th>
                        <th colSpan="7" className="text-center str">Suivi passation et exécution</th>
                    </tr>
                    <tr>
                        <th className="min-w13 str">Niveau de contractualisation du projet</th>
                        <th className="min-w4 str">N° du Marché</th>
                        <th className="min-w4 str">Date OS de demarrage</th>
                        <th className="str">Taux de consommation</th>
                        <th className="str">Taux d'avancement</th>
                        <th className="min-w12 str">Contraintes/Difficultés éventuelles</th>
                        <th className="min-w12 str">Propositions de solutions</th>
                    </tr>
                </thead>
                <tbody> 
                {data.map((i,j)=>
                    <tr key={j}>
                        <td>{j+1}</td>
                        <td>{i.region.replaceAll("_","-")}</td>
                        {categorie==="MAIRE"&&(
                        <>
                            <td>{i.departement}</td>
                            <td>{i.commune}</td>
                        </>     
                        )}
                        <td >{i.mission}</td>
                        <td >{i.objectif}</td>
                        <td >{i.allotissement}</td>
                        <td className="end">{numStr(i.ttc,"")}</td>
                        <td className="end">{numStr(i.budget_anterieur)}</td>
                        <td className="end">{numStr(i.budget_n) }</td>
                        <td>{i.prestataire}</td>
                        <td>{i.ordonnateur}</td> 

                        {i.passation.length?
                            <>
                                <td>{i.passation.slice(-1).pop().contractualisation}</td>
                                <td>{i.passation.slice(-1).pop().numeroMarche}</td>
                                <td>{new Date(i.passation.slice(-1).pop().dateOs).toLocaleDateString()}</td>
                            </>
                        :
                            <><td></td><td></td><td></td></>
                        }
                        {i.suiviTravaux.length?
                        <>                
                            <td>{i.suiviTravaux.slice(-1).pop().tauxConsommation} %</td>
                            <td>{i.suiviTravaux.slice(-1).pop().tauxAvancement} %</td>
                            <td>{i.suiviTravaux.slice(-1).pop().description}</td>
                            <td>{i.suiviTravaux.slice(-1).pop().proposition}</td>
                        </>
                        :<>
                            <td></td><td></td><td></td><td></td>
                        </>
                        }                
                    </tr>
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
                        <th rowSpan="2">N°</th>
                        <th rowSpan="2">Région</th>
                        {categorie==="COMMUNALE" &&(
                        <>
                            <th rowSpan="2">Département</th>
                            <th rowSpan="2" className="min-w3">Commune</th>
                        </>
                        )}
                        <th rowSpan="2" className="min-w2">Catégorie</th>
                        <th rowSpan="2" className="min-w1">Projets/troçons</th>
                        <th rowSpan="2">Code route</th>
                        <th rowSpan="2">Linéaire_route (km)</th>
                        <th rowSpan="2">Linéaire_OA (ml)</th>
                        <th rowSpan="2" className="min-w4">Budget total TTC (FCFA)</th>
                        <th rowSpan="2" className="min-w4">Budget antérieur (FCFA)</th>
                        <th rowSpan="2" className="min-w4">{`budget ${programme.annee}`} (FCFA)</th>
                        <th rowSpan="2" className="min-w3">Prestataire</th>
                        <th colSpan="7" className="text-center str">Suivi passation et exécution</th>
                    </tr>
                    <tr>
                        <th className="min-w13 str">Niveau de contractualisation du projet</th>
                        <th className="min-w4 str">N° du Marché</th>
                        <th className="min-w4 str">Date OS  de demarrage</th>
                        <th className="str">Taux de consommation</th>
                        <th className="str">Taux d'avancement</th>
                        <th className="min-w12 str">Contraintes/Difficultés éventuelles</th>
                        <th className="min-w12 str">Propositions de solutions</th>
                    </tr>
                </thead>
                <tbody> 
                {data.map((i,j)=>
                    <tr key={j}>
                        <td>{j+1}</td>
                        <td>{i.region.replaceAll("_","-")}</td>
                        {categorie==="COMMUNALE" &&(
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
                        <td>{i.prestataire}</td>
                        {i.passation.length?
                            <>
                                <td>{i.passation.slice(-1).pop().contractualisation}</td>
                                <td>{i.passation.slice(-1).pop().numeroMarche}</td>
                                <td>{new Date(i.passation.slice(-1).pop().dateOs).toLocaleDateString()}</td>
                            </>
                        :
                            <><td></td><td></td><td></td></>
                        }

                        {i.suiviTravaux.length?
                        <>                
                            <td>{i.suiviTravaux.slice(-1).pop().tauxConsommation} %</td>
                            <td>{i.suiviTravaux.slice(-1).pop().tauxAvancement} %</td>
                            <td>{i.suiviTravaux.slice(-1).pop().description}</td>
                            <td>{i.suiviTravaux.slice(-1).pop().proposition}</td>
                        </>
                        :<>
                            <td></td><td></td><td></td><td></td>
                        </>
                        }                       
                    </tr>

                )}

                </tbody>
            </table>
        </div>
    )
}