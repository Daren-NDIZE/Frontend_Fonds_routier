import { useRef,useState,useEffect } from "react"
import ModalBox from "../../component/modalBox"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import Notification from "../../component/notification"
import PageLoader from "../../component/pageLoader"
import FormMINHDU from "../../component/formMINHDU"
import { Link, useNavigate, useParams } from "react-router-dom"
import { fetchGet,Fetch, fetchFormData } from "../../config/FetchRequest"
import { numStr, parseTable, totalBudget } from "../../script"
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { downLoadExcel } from "jsxtabletoexcel"

function ProgrammeMINHDU(){

    let statut=["EN_ATTENTE_DE_SOUMISSION","CORRECTION","REJETER"]

    let modal=useRef()
    let modalBox1=useRef()
    let modalBox=useRef()
    let modal2=useRef()
    let modal3=useRef()
    let notification=useRef()
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

    let searchKey=["region","ville","type_travaux","budget_n","prestataire","ordonnateur"]

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
                        setData(resData.projetList.filter(i=>i.financement!=="RESERVE"))
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

        if(form.region.value==="" ||form.ville.value==="" || form.troçon.value==="" ||
         form.ttc.value==="" || form.budget_n.value==="" || form.ordonnateur.value==="" )
            {
            return;
        }
        setPageLoader(true)
        modal.current.setModal(false)

        let formData =new FormData(form);
        let datas=Object.fromEntries(formData)

        try{

            let res= await Fetch(`addProjetToProgrammeMINHDU/${id}`,"POST",datas)
            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){
                    
                    let response = await fetchGet(`programmeByRole/${id}`)
                    if(response.ok){
                        let resdata= await response.json()
                        
                        projet.current=resdata.projetList.filter(i=>i.financement!=="RESERVE")
                        setData(resdata.projetList.filter(i=>i.financement!=="RESERVE"))
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

        let decision=window.confirm("voulez vous vraiment modifier ce projet?")
        if(!decision){
            modal.current.setModal(false)
            return;
        }

        if(form.region.value==="" ||form.ville.value==="" || form.troçon.value==="" ||
         form.ttc.value==="" || form.budget_n.value==="" || form.ordonnateur.value==="" )
            {
            return;
        }
        setPageLoader(true)
        modal.current.setModal(false)

        let formData =new FormData(form);
        let datas=Object.fromEntries(formData)

        try{

            let res= await Fetch(`updateProjetMINHDU/${id}`,"PUT",datas)
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

    const deleted= async (id)=>{

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
                        setData(resdata.projetList.filter(i=>i.financement!=="RESERVE"))
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
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                if(resData.type==="succes"){
                    programme.prevision=parseInt(form.prevision.value) ;
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
                <div>
                    
                </div>
                <div className="box b-search">
                    <SearchBar data={projet.current} onSetData={setData} keys={searchKey}/>
                </div>
            </div>
            
            <div className="box">
                <div id="pg-title" className={statut.includes(programme.statut)?"":"mb-25"}>
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
                                <th>N°</th>
                                <th>Région</th>
                                <th>Ville</th>
                                <th className="min-w13">Type de travaux</th>
                                <th className="min-w1">Troçons / Intitulé</th>
                                <th>Linéaire_(ml)</th>
                                <th className="min-w4">Budget total TTC</th>
                                <th className="min-w4">Budget antérieur</th>
                                <th className="min-w4">Budget {programme.annee}</th>
                                {(programme.statut==="VALIDER" || programme.type==="AJUSTER") &&(
                                <>
                                    <th className="min-w4">Engagement</th>
                                    <th className="min-w4">Reliquat</th>
                                </> 
                                )}
                                <th className="min-w4">Projection {programme.annee+1}</th>
                                <th className="min-w4">Projection {programme.annee+2}</th>
                                <th className="min-w3">Prestataire</th>
                                <th>Ordonnateur</th>
                                <th className="min-w1">Observation</th>
                                {(programme.statut==="VALIDER" || programme.type==="AJUSTER") &&(
                                <>
                                    <th className="min-w4">Situation</th>
                                    <th className="min-w1">Motif</th>
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
                            <tr key={j}>
                                <td>{j+1}</td>
                                <td>{i.region.replaceAll("_","-")}</td>
                                <td >{i.ville}</td>
                                <td>{i.type_travaux}</td>
                                <td>{i.troçon}</td>
                                <td>{numStr(i.lineaire)}</td>
                                <td>{numStr(i.ttc)}</td>
                                <td>{numStr(i.budget_anterieur)}</td>
                                <td>{numStr(i.budget_n) }</td>
                                <td>{i.suivi && numStr(i.suivi.engagement)}</td>
                                <td>{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                                <td>{numStr(i.budget_n1)}</td>
                                <td>{numStr(i.budget_n2)}</td>
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
                                </td>
                                )}                         
                            </tr>
                            )
                        :
                        
                        data.map((i,j)=>
                            <tr key={j}>
                                <td>{j+1}</td>
                                <td>{i.region.replaceAll("_","-")}</td>
                                <td >{i.ville}</td>
                                <td>{i.type_travaux}</td>
                                <td>{i.troçon}</td>
                                <td>{numStr(i.lineaire)}</td>
                                <td>{numStr(i.ttc)}</td>
                                <td>{numStr(i.budget_anterieur)}</td>
                                <td>{numStr(i.budget_n) }</td>
                                <td>{numStr(i.budget_n1)}</td>
                                <td>{numStr(i.budget_n2)}</td>
                                <td>{i.prestataire}</td>
                                <td>{i.ordonnateur}</td>
                                <td>{i.observation}</td>
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
                                <td colSpan="8">Provision de réserve</td>
                                <td>{numStr(programme.prevision,0)} fcfa</td>
                                <td>{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)} fcfa</td>
                                <td>{numStr(programme.prevision-totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)} fcfa</td>
                                <td colSpan="8">
                                    <Link to={`/programmes/programme-MINHDU/${programme.id}/prévision`} >Détails</Link>
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
                    <div>{numStr(totalBudget(projet.current.filter(i=>i.ordonnateur==="MINHDU")),0)} fcfa</div>
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
                <FormMINHDU title={programme.intitule} annee={programme.annee} body={state}/>
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

            <ModalBox ref={modalBox}>
                <form method="post" encType="multipart/form-data" className="flex-form" onSubmit={importFile}>
                    <div>
                        <div className="form-line">
                            <label>Fichier excel</label>
                            <input type="file"  name="file" required/>
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

export default ProgrammeMINHDU

