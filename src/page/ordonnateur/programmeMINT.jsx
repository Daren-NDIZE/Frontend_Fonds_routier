import ModalBox from "../../component/modalBox";
import SearchBar from "../../component/searchBar";
import Notification from "../../component/notification";
import Loader from "../../component/loader";
import PageLoader from "../../component/pageLoader";
import FormMINT from "../../component/formMINT";
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, } from "react-router-dom";
import { Fetch, fetchFormData, fetchGet } from "../../config/FetchRequest";
import { numStr,parseTable,totalBudget, totalEngagement, focusLine } from "../../script";
import { downLoadExcel } from "jsxtabletoexcel";

function ProgrammeMINT (){

    let statut=["EN_ATTENTE_DE_SOUMISSION","CORRECTION","REJETER"]

    let modalBox=useRef()
    let modal=useRef()
    let modalBox1=useRef()
    let notification=useRef()
    let modal2=useRef()
    let modal3=useRef()
    let projet=useRef([])

    let [programme,setProgramme]=useState({})
    let [loader,setLoader]=useState(true)
    let [pageLoader,setPageLoader]=useState()
    let [state,setState]=useState({})
    let [data,setData]=useState([])
    let [categorie,setCategorie]=useState("MINT")
    let [check,setCheck]=useState(false)
    let [deleteId,setDeleteId]=useState()
    let [pdf,setPdf]=useState()

    const {id}=useParams()
    const navigate=useNavigate()

    let totalB=totalBudget(data)
    let totalE=totalEngagement(data)

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    useEffect(()=>{
        (async function (){

            if(isNaN(id)){
                navigate(-1)
                return;
            }
            try{
                let res = await fetchGet(`programmeByRole/${id}`)
                if(res.ok){
                    let resData= await res.json()

                    if(resData.type==="erreur"){
                        navigate(-1)
                    }else{
                        setProgramme(resData)
                        projet.current=resData.projetList.filter(i=>i.financement!=="RESERVE")
                        setData(resData.projetList.filter(i=>(i.financement!=="RESERVE" && i.ordonnateur==="MINT")))
                    }
                }
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }

        })()
    },[id,navigate])


    const submit=async (e)=>{

        e.preventDefault()
        let form=e.target

        if(form.region.value==="" ||form.mission.value==="" || form.objectif.value==="" ||
         form.ttc.value==="" || form.budget_n.value==="" || form.ordonnateur.value==="" )
            {
            return;
        }
        setPageLoader(true)
        modal.current.setModal(false)

        let formData =new FormData(form);
        let datas=Object.fromEntries(formData)

        try{

            let res= await Fetch(`addProjetToProgrammeMINT/${id}`,"POST",datas)
            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){
                    
                    let response = await fetchGet(`programmeByRole/${id}`)
                    if(response.ok){
                        let resdata= await response.json()

                        projet.current=resdata.projetList.filter(i=>i.financement!=="RESERVE")
                        setData(resdata.projetList.filter(i=>(i.financement!=="RESERVE" && i.ordonnateur===categorie) ))
                    }
                }
                
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }
 
    }

    const update=async (e,id)=>{

        e.preventDefault()
        let form=e.target

        let decision= window.confirm("voulez vous vraiment modifier ce projet?")
        if(!decision){
            modal.current.setModal(false)
            return;
        }

        if(form.region.value==="" ||form.mission.value==="" || form.objectif.value==="" ||
         form.ttc.value==="" || form.budget_n.value==="" || form.ordonnateur.value==="" )
            {
            return;
        }
        setPageLoader(true)
        modal.current.setModal(false)

        let formData =new FormData(form);
        let datas=Object.fromEntries(formData)

        try{

            let res= await Fetch(`updateProjetMINT/${id}`,"PUT",datas)
            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){

                    let index= data.indexOf(data.find(i=>i.id===id))
                    datas.id=id
                    if(data[index].suivi){
                        datas.suivi=data[index].suivi
                    }
                    data[index]=datas
                    index= projet.current.indexOf(projet.current.find(i=>i.id===id))
                    projet.current[index]=datas
                    if(datas.ordonnateur===categorie){
                        setData(data)
                    }else{
                        setData(data=>data.filter(i=>i.id!==id))
                    }
                }
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }
 
    }

    const deleted= async (id)=>{

        setPageLoader(true)
        modal2.current.setModal(false)
        try{

            let res= await Fetch(`deleteProjet/${id}`,"DELETE")
            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){
                    data= data.filter(i=>i.id!==id)
                    projet.current=projet.current.filter(i=>i.id!==id)
                    setData(data)
                }

                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }
 
    }

    const importFile=async (e)=>{

        e.preventDefault()
        let form=e.target

        
        setPageLoader(true)
        modalBox.current.setModal(false)

        let formData =new FormData(form);

        try{

            let res= await fetchFormData(`programme/importProgrammeFile/${id}`,"POST",formData)

            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){
                    
                    let response = await fetchGet(`programmeByRole/${id}`)
                    if(response.ok){
                        let resdata= await response.json()
                        
                        projet.current=resdata.projetList.filter(i=>i.financement!=="RESERVE")
                        setData(resdata.projetList.filter(i=>i.financement!=="RESERVE" && i.ordonnateur===categorie))
                    }
                }

                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }
 
    }

    const setPrevision= async(e,id)=>{

        e.preventDefault()
        let form=e.target
       
        if(form.prevision.value==="" ){
            return;
        }

        setPageLoader(true)
        modal3.current.setModal(false)

        let formData =new FormData(form);
        let data=Object.fromEntries(formData)

        try{

            let res= await Fetch(`updatePrevision/${id}`,"PUT",data)
            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){

                    programme.prevision=form.prevision.value;
                    setProgramme(programme)
                }

                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }
    }

    const submitPg=async(id)=>{

        let decision =window.confirm("voulez vous vraiment soumettre ce programme?")
        if(!decision){
            return
        }
        setPageLoader(true)
        try{

            let res= await Fetch(`submitProgramme/${id}`,"PUT")
            if(res.ok){
                let resData= await res.json()

                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                
                if(resData.type==="succes"){
                    window.setTimeout(()=>{
                        navigate("/programmes")
                    },2000)
                }

                
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }

        
    }

    const open=()=>{
        setState({function:submit})
        modal.current.setModal(true)
    }

    const deleteModal=(id)=>{
        setDeleteId(id)
        modal2.current.setModal(true)
    }

    const handleClick=(id)=>{

        let projet=data.find(i=>i.id===id)
        setState({function:update, data:projet})
        modal.current.setModal(true)
    }

    const changeTable=(e,i)=>{

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

    const searchChoose=(categorie)=>{

        let data
        let key

        if(categorie==="MINT"){
            data=projet.current.filter(i=>i.ordonnateur==="MINT")
            key=["region","budget_n","prestataire","ordonnateur"]

            return ({data:data, key: key})

        }else{

            data=projet.current.filter(i=>i.ordonnateur==="MAIRE")
            key=["region","departement","commune","budget_n","prestataire","ordonnateur"]

            return ({data:data, key: key})

        }
    }

    const loadPdf=async(id)=>{

        modalBox1.current.setModal(true)
        try{
            let res= await fetchFormData(`projet/getBordereau/${id}`,"GET")
            if(res.ok){
                
                let blob = await res.blob()
                const url=window.URL.createObjectURL(blob)
                console.log(url.substring(5))
                setPdf(url) 
            }  
        }catch(e){
            console.log(e)
        }

    }

    const exportExcel=(fileName)=>{
        
        downLoadExcel(document.querySelector(".table"),"feuille 1",fileName)
    }

    if(loader){
        return(
            <Loader/>
        )
    }

    return(

        <div className="container pb-10" >
            <Notification ref={notification} />
            
            <div className="flex">
                <div className="retour-container">
                    <button className="retour-btn" onClick={()=>navigate(-1)}>
                        <i className="fa-solid fa-arrow-left"></i>
                         Retour
                    </button>
                </div>
                <div className="box b-search">
                <SearchBar data={searchChoose(categorie).data} keys={searchChoose(categorie).key} onSetData={setData} />
                </div>
            </div>

            <div className="box slide">
                <div id="pg-title">
                    <h1>{programme.intitule}</h1>

                    {programme.statut==="EN_ATTENTE_DE_SOUMISSION" &&(
                    <button className="download-btn" onClick={()=>modalBox.current.setModal(true)}>
                        <i className="fa-solid fa-up-long"></i>
                    </button>
                    )}
                    
                    <button className="download-btn" onClick={()=>exportExcel(programme.intitule)}>
                        <i className="fa-solid fa-down-long"></i>
                    </button>
                </div>

                <div className="top-element">
                    <div>
                        <ul>
                            <li className="active" onClick={(e)=>changeTable(e,"MINT")}>Gestion centrale</li>
                            <li onClick={(e)=>changeTable(e,"MAIRE")}>Gestion communale</li>
                        </ul>
                        {statut.includes(programme.statut) &&(
                        <div className="check-update">
                            <label htmlFor="check">Modifier</label>
                            <input type="checkbox" id="check" onChange={(e)=>setCheck(e.target.checked)}/>
                        </div>
                        )}
                        
                    </div>
                    
                    {statut.includes(programme.statut) &&(
                    <div className="n-projet">
                        <button onClick={open}>Nouveau projet</button>
                    </div>
                    )}
                </div>
                
                <div className="tableBox">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Region</th>
                                {categorie==="MAIRE"&&(
                                <>
                                <th className="min-w3">Département</th>
                                <th className="min-w3">Commune</th>
                                </>
                                )}
                                <th className="min-w1">Activités</th>
                                <th className="min-w1">Objectifs</th>
                                <th className="min-w12">Allotissement</th>
                                <th className="min-w4">Budget total TTC (FCFA)</th>
                                <th className="min-w4">Budget_antérieur (FCFA)</th>
                                <th className="min-w4">Budget {programme.annee} (FCFA)</th>
                                {(programme.statut==="VALIDER"|| programme.type==="AJUSTER")&&(
                                <>
                                    <th className="min-w4">Engagement (FCFA)</th>
                                    <th className="min-w4">Reliquat (FCFA)</th>
                                </> 
                                )}
                                <th className="min-w4">Projection {programme.annee+1} (FCFA)</th>
                                <th className="min-w4">Projection {programme.annee+2} (FCFA)</th>
                                <th className="min-w3">Prestataire</th>
                                <th>Ordonnateur</th>
                                <th className="min-w1">Observations</th>
                                {(programme.statut==="VALIDER" || programme.type==="AJUSTER")&&(
                                <>
                                    <th className="min-w4">Situation</th>
                                    <th className="min-w1">Motifs eventuels</th>
                                    <th className="min-w4">Suivi travaux</th>
                                </> 
                                )}
                                {check &&(
                                    <th>Action</th>
                                )}
                            </tr>
                        </thead>
                        <tbody> 
                        {programme.statut==="VALIDER" || programme.type==="AJUSTER"?

                            data.map((i,j)=>
                                <tr key={j} onDoubleClick={focusLine}>
                                    <td>{j+1}</td>
                                    <td>{i.region.replaceAll("_","-")}</td>
                                    {categorie==="MAIRE" &&(
                                    <>
                                    <td>{i.departement}</td>
                                    <td>{i.commune}</td>
                                    </>
                                    )}
                                    <td>{i.mission}</td>
                                    <td>{i.objectif}</td>
                                    <td className="min-w12">{i.allotissement}</td>
                                    <td className="end">{numStr(i.ttc,"")}</td>
                                    <td className="end">{numStr(i.budget_anterieur)}</td>
                                    <td className="end">{numStr(i.budget_n) }</td>
                                    <td className="end">{i.suivi && numStr(i.suivi.engagement)}</td>
                                    <td className="end">{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                                    <td className="end">{numStr(i.budget_n1)}</td>
                                    <td className="end">{numStr(i.budget_n2)}</td>
                                    <td>{i.prestataire}</td>
                                    <td>{i.ordonnateur}</td>
                                    <td>{i.observation}</td>
                                    <td>
                                    {i.suivi &&(
                                        i.bordereau?
                                        <p  onClick={()=>loadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                                        :i.suivi.statut
                                    )}
                                    </td>                                    
                                    <td>
                                        {i.suivi && (
                                            parseTable(i.suivi.motif).map((k,l)=><li key={l}>{k}</li>)
                                        )}
                                    </td> 
                                    <td>{(i.bordereau) && 
                                        <Link to={`/programmes/projet/${i.id}/suivi-des-travaux`}>Détails</Link>
                                    }
                                    </td> 
                                    {check &&(
                                    <td> 
                                        <div className="t-action">
                                            <i className="fa-solid fa-pen-to-square" onClick={()=>handleClick(i.id)}></i>
                                            <i className="fa-solid fa-trash-can" onClick={()=>deleteModal(i.id)}></i>
                                        </div>
                                    </td>)}                               
                                </tr>
                            )
                        
                        :
                            data.map((i,j)=>
                                <tr key={j} onDoubleClick={focusLine}>
                                    <td>{j+1}</td>
                                    <td>{i.region.replaceAll("_","-")}</td>
                                    {categorie==="MAIRE" &&(
                                    <>
                                    <td>{i.departement}</td>
                                    <td>{i.commune}</td>
                                    </>
                                    )}
                                    <td>{i.mission}</td>
                                    <td>{i.objectif}</td>
                                    <td>{i.allotissement}</td>
                                    <td className="end">{numStr(i.ttc,"")}</td>
                                    <td className="end">{numStr(i.budget_anterieur)}</td>
                                    <td className="end">{numStr(i.budget_n) }</td>
                                    <td className="end">{numStr(i.budget_n1)}</td>
                                    <td className="end">{numStr(i.budget_n2)}</td>
                                    <td>{i.prestataire}</td>
                                    <td>{i.ordonnateur}</td>
                                    <td>{i.observation}</td>
                                    {check &&(
                                    <td> 
                                        <div className="t-action">
                                            <i className="fa-solid fa-pen-to-square" onClick={()=>handleClick(i.id)}></i>
                                            <i className="fa-solid fa-trash-can" onClick={()=>deleteModal(i.id)}></i>
                                        </div>
                                    </td>)}
                                </tr>
                            )
                        }

                        {(programme.statut==="VALIDER" || programme.type==="AJUSTER") &&(
                            <tr className="t-line">
                                <td colSpan={categorie==="MINT"?"7":"9"} > Total</td>
                                <td className="end">{numStr(totalB)}</td>
                                <td className="end">{numStr( totalE ,0)}</td>
                                <td className="end">{numStr(totalB-totalE , 0)}</td>
                                <td colSpan="8">
                                </td>
                            </tr>
                        )}
                        
                        
                        { (programme.statut==="VALIDER" && programme.type!=="REPORT") &&(
                            <tr>
                                <td colSpan="7">Provision de réserve</td>
                                <td className="end">{numStr(programme.prevision,0)}</td>
                                <td className="end">{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                                <td className="end">{numStr(programme.prevision-totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                                <td colSpan="7">
                                    <Link to={`/programmes/programme-MINT/${programme.id}/prévision`} >Détails</Link>
                                </td>
                            </tr>
                        )}
                            
                            
                        </tbody>
                    </table>
                </div>
                
            </div>

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
                        {statut.includes(programme.statut) &&(

                        <i className="fa-solid fa-circle-plus" onClick={()=>modal3.current.setModal(true)}></i>                   

                        )}
                     </div>
                </div>
                <div className="p-total">
                    <div>Total</div>
                    <div>{numStr(totalBudget(projet.current,programme.prevision),0)} fcfa</div>
                </div>
            </div>

            {statut.includes(programme.statut) &&(

            <div className="p-sub">
                <p>Le programme ne sera plus modifiable lorqu'il sera soumis.</p>
                <button onClick={()=>{submitPg(programme.id)}}>Soumettre</button>
            </div> 

            )}
            

            <ModalBox ref={modal}>
                <FormMINT title={programme.intitule} annee={programme.annee} body={state}/>
            </ModalBox>

            <ModalBox ref={modal2}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer ce projet?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={()=>deleted(deleteId)}>OUI</button>
                        <button className="b-btn" onClick={()=>{modal2.current.setModal(false)}}>NON</button>
                    </div>
                </div>
            </ModalBox>
            
            <ModalBox ref={modal3}>
                <form method="post" className="flex-form" onSubmit={(e)=>setPrevision(e,programme.id)}>
                    <div>
                        <div className="form-line">
                            <label>provision de réserve</label>
                            <input type="number" min="0" name="prevision" defaultValue={programme.prevision} required/>
                        </div>
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div>
                        
                </form>
            </ModalBox>

            <ModalBox ref={modalBox}>
                <form method="post" encType="multipart/form-data" className="flex-form" onSubmit={importFile}>
                    <div>
                        <div className="form-line">
                            <label>Fichier excel</label>
                            <input type="file"  name="file" accept=".xlsx, .xls" required/>
                        </div>
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Importer</button>
                        </div>
                    </div>     
                </form>
            </ModalBox>

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

export default ProgrammeMINT;


