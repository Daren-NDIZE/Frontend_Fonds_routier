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
import { numStr,parseTable,totalBudget } from "../../script";
import { downLoadExcel } from "jsxtabletoexcel";

function ProgrammeMINT (){

    let statut=["EN_ATTENTE_DE_SOUMISSION","CORRECTION","REJETER"]

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
    let [check,setCheck]=useState(false)
    let [deleteId,setDeleteId]=useState()
    let [pdf,setPdf]=useState()

    const {id}=useParams()
    const navigate=useNavigate()

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
                        projet.current=resData.projetList
                        setData(resData.projetList)
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
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                if(resData.type==="succes"){
                    
                    let res = await fetchGet(`programmeByRole/${id}`)
                    if(res.ok){
                        let resData= await res.json()
                        setProgramme(resData)
                        projet.current=resData.projetList
                        setData(resData.projetList)
                    }
                }
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
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                if(resData.type==="succes"){
                    let index= data.indexOf(data.find(i=>i.id===id))
                    datas.id=id
                    data[index]=datas
                    projet.current[index]=datas
                    setData(data)
                }
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }
 
    }

    const deleted= async (e,id)=>{

        setPageLoader(true)
        modal2.current.setModal(false)

        try{

            let res= await Fetch(`deleteProjet/${id}`,"DELETE")
            if(res.ok){
                let resData= await res.json()
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                if(resData.type==="succes"){
                    data= data.filter(i=>i.id!==id)
                    projet.current=projet.current.filter(i=>i.id!==id)
                    setData(data)
                }
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
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                if(resData.type==="succes"){

                    programme.prevision=form.prevision.value;
                    setProgramme(programme)
                }
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

    const change=(e)=>{

        setCheck(e.target.checked)
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
                    <SearchBar/>
                </div>
            </div>

            <div className="box">
                <div id="pg-title" className={statut.includes(programme.statut)?"":"mb-25"}>
                    <h1>{programme.intitule}</h1>
                    <button className="download-btn" onClick={()=>exportExcel(programme.intitule)}>
                        <i className="fa-solid fa-down-long"></i>
                    </button>
                </div>

                {statut.includes(programme.statut) &&(

                <div className="top-element">
                    <div className="check-update">
                        <label htmlFor="check">Modifier</label>
                        <input type="checkbox" id="check" onChange={change}/>
                    </div>
                    <div className="n-projet">
                        <button onClick={open}>Nouveau projet</button>
                    </div>
                </div>  

                )}
                
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
                                <th>Budget_antérieur</th>
                                <th>{`Budget_${programme.annee}`}</th>
                                {programme.statut==="VALIDER"&&(
                                <>
                                    <th>Engagement</th>
                                    <th>Reliquat</th>
                                </> 
                                )}
                                <th>{`Projection_${programme.annee+1}`}</th>
                                <th>{`Projection_${programme.annee+2}`}</th>
                                <th>Prestataire</th>
                                <th>Ordonnateur</th>
                                <th>Observations</th>
                                {programme.statut==="VALIDER"&&(
                                <>
                                    <th>Situation</th>
                                    <th>Motif</th>
                                </> 
                                )}
                                {check &&(
                                    <th>Action</th>
                                )}
                            </tr>
                        </thead>
                        <tbody> 
                        {programme.statut==="VALIDER"?

                            data.map((i,j)=>
                                <tr key={j}>
                                    <td>{j+1}</td>
                                    <td>{i.region}</td>
                                    <td className="min-w1">{i.mission}</td>
                                    <td className="min-w1">{i.objectif}</td>
                                    <td className="min-w12">{i.allotissement}</td>
                                    <td>{numStr(i.ttc,"")}</td>
                                    <td className="min-w4">{numStr(i.budget_anterieur)}</td>
                                    <td className="min-w4">{numStr(i.budget_n) }</td>
                                    <td className="min-w4">{i.suivi && numStr(i.suivi.engagement)}</td>
                                    <td className="min-w4">{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement)}</td>
                                    <td className="min-w4">{numStr(i.budget_n1)}</td>
                                    <td className="min-w4">{numStr(i.budget_n2)}</td>
                                    <td className="min-w3">{i.prestataire}</td>
                                    <td>{i.ordonnateur}</td>
                                    <td className="min-w1">{i.observation}</td>
                                    <td className="min-w4">
                                    {i.suivi &&(
                                        i.suivi.statut==="Visé"?
                                        <p  onClick={()=>loadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                                        :i.suivi.statut
                                    )}
                                    </td>                                    
                                    <td className="min-w1">
                                        {i.suivi && (
                                            parseTable(i.suivi.motif).map((k,l)=><li key={l}>{k}</li>)
                                        )}
                                    </td>                                
                                </tr>
                            )
                        
                        :
                            data.map((i,j)=>
                                <tr key={j}>
                                    <td>{j+1}</td>
                                    <td>{i.region}</td>
                                    <td className="min-w1">{i.mission}</td>
                                    <td className="min-w1">{i.objectif}</td>
                                    <td className="min-w12">{i.allotissement}</td>
                                    <td>{numStr(i.ttc,"")}</td>
                                    <td className="min-w4">{numStr(i.budget_anterieur)}</td>
                                    <td className="min-w4">{numStr(i.budget_n) }</td>
                                    <td className="min-w4">{numStr(i.budget_n1)}</td>
                                    <td className="min-w4">{numStr(i.budget_n2)}</td>
                                    <td className="min-w3">{i.prestataire}</td>
                                    <td>{i.ordonnateur}</td>
                                    <td className="min-w1">{i.observation}</td>
                                    {check &&(
                                    <td> 
                                        <div className="t-action">
                                            <i className="fa-solid fa-pen-to-square" onClick={()=>handleClick(i.id)}></i>
                                            <i className="fa-solid fa-trash-can" onClick={()=>deleteModal(i.id)}></i>
                                        </div>
                                    </td>
                                    )}
                                </tr>
                            )
                        }
                        
                        {programme.statut==="VALIDER" &&(
                            <tr>
                                <td colSpan="7">Prévision de réserve</td>
                                <td>{numStr(programme.prevision,0)} fcfa</td>
                                <td>{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)} fcfa</td>
                                <td>{numStr(programme.prevision-totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)} fcfa</td>
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
                    <div>Prévision de réserve</div>
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
                            <label>prévision de réserve</label>
                            <input type="number" min="0" name="prevision" defaultValue={programme.prevision} required/>
                        </div>
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
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


