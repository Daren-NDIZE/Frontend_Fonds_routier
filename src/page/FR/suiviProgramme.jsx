import { useRef,useState,useEffect } from "react"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import Notification from "../../component/notification"
import PageLoader from "../../component/pageLoader"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Fetch, fetchFormData, fetchGet } from "../../config/FetchRequest"
import { Rejet, numStr, parseTable, selectValue, totalBudget, totalEngagement, focusLine } from "../../script"
import ModalBox from "../../component/modalBox"
import Select from 'react-select'
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { downLoadExcel } from "jsxtabletoexcel"
import FormMINT from "../../component/formMINT"
import FormMINTP from "../../component/formMINTP."
import FormMINHDU from "../../component/formMINHDU"



function SuiviProgramme({ordonnateur,role}){

    let modal=useRef()
    let modalBox=useRef()
    let modalBox1=useRef()
    let modal1=useRef()
    let notification=useRef()
    let projet=useRef([])

    let [programme,setProgramme]=useState({})
    let [loader,setLoader]=useState(true)
    let [statut,setStatut]=useState()
    let [motif,setMotif]=useState([])
    let [erreur,setErreur]=useState("")
    let [pageLoader,setPageLoader]=useState()
    let [data,setData]=useState([])
    let [projetId,setProjetId]=useState()
    let [pdf,setPdf]=useState()
    let [categorie,setCategorie]=useState("")
    let [state,setState]=useState({})
    let [deleteId,setDeleteId]=useState()
    let [check,setCheck]=useState(false)
    
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const {id}=useParams()
    const navigate=useNavigate()


    useEffect(()=>{
        (async function (){

            if(isNaN(id)){
                navigate(-1)
                return;
            }
            try{
                let res = await fetchGet(`programme/${id}`)
                if(res.ok){
                    let resData= await res.json()


                    if(resData.type==="erreur" || resData.statut!=="VALIDER" ||
                        resData.ordonnateur!==ordonnateur){
                        navigate(-1)
                    }else{
                        setProgramme(resData)
                        projet.current=resData.projetList.filter(i=>i.financement!=="RESERVE")
                        if(resData.ordonnateur==="MINTP"){
                            setCategorie("CENTRALE")
                            setData(resData.projetList.filter(i=>(i.financement!=="RESERVE" && i.categorie!=="PROJET A GESTION COMMUNALE") ))
                            return;                  
                        }else if(resData.ordonnateur==="MINT"){
                            setCategorie("MINT")
                            setData(resData.projetList.filter(i=>(i.financement!=="RESERVE" && i.ordonnateur==="MINT")))
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

    
    const submit= async(e)=>{

        e.preventDefault()
        setErreur("")
        let form=e.target

        if(form.other && form.other.value){
            let value=motif
            value.push({value: form.other.value})
            setMotif(value)
        }
        if(form.statut.value==="" )
        {
            setErreur("veuillez remplir tous les champs")
            return;
        }
        if(statut==="Attente de visa" && (form.engagement.value==="" || form.prestataire.value==="")){
            setErreur("veuillez remplir tous les champs")
            return;
        }
        if((statut==="Rejeter" || statut==="En attente pour correction") && selectValue(motif)===""){
            setErreur("veuillez remplir tous les champs")
            return;
        }
        
        let projet =data.find(i=>i.id===projetId)

        if(form.engagement && (parseInt(form.engagement.value) > projet.budget_n)){

            let confirm=window.confirm("Le montant a engagé est superieure au montant prévisionnel, l'excédent sera engagé dans la prévision de réserve")
            if(!confirm){
                return;
            }
        }

        let formData =new FormData(form);
        formData.append("motif", selectValue(motif))
        modal.current.setModal(false)
        setPageLoader(true)
        try{
            let res= await fetchFormData(`suiviProjet/${projetId}`,"POST",formData)
            if(res.ok){
                let resData= await res.json()

                if(resData.type==="succes"){

                    let response = await fetchGet(`programme/${id}`)

                    if(response.ok){
                        let dataRes =await response.json() 
                        setProgramme(dataRes)
                        projet.current=dataRes.projetList.filter(i=>i.financement!=="RESERVE")
                        if(dataRes.ordonnateur==="MINTP"){
                            categorie==="COMMUNE"?
                            setData(dataRes.projetList.filter(i=>(i.financement!=="RESERVE" && i.categorie==="PROJET A GESTION COMMUNALE") )) 
                            : 
                            setData(dataRes.projetList.filter(i=>(i.financement!=="RESERVE" && i.categorie!=="PROJET A GESTION COMMUNALE") )) 
               
                        }else if(dataRes.ordonnateur==="MINT"){
                            setData(dataRes.projetList.filter(i=>(i.financement!=="RESERVE" && i.ordonnateur===categorie) ))                 
                        }
                        else{
                            setData(dataRes.projetList.filter(i=>i.financement!=="RESERVE"))
                        }
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
            setMotif([])
            setStatut("Traitment DCO")
            setPageLoader(false)
        }

    }

    const cloture=async(id)=>{

        let decision =window.confirm("voulez vous vraiment cloturer ce programme?")
        if(!decision){
            return
        }
        setPageLoader(true)
        try{
            let res= await Fetch(`clotureProgramme/${id}`,"PUT")
            if(res.ok){
                let resData= await res.json()
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                if(resData.type==="succes"){
                    window.setTimeout(()=>{
                        navigate("/execution-des-programme")
                    },2000)
                }
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }

        
    }

    const saveProjet=async (e)=>{

        e.preventDefault()
        let form=e.target

        if(form.ville && form.ordonnateur){

            if(form.region.value==="" ||form.ville.value==="" || form.troçon.value==="" ||
                form.ttc.value==="" || form.budget_n.value==="" || form.ordonnateur.value==="" )
            {
            return;
            }
        }else if(form.mission && form.objectif){

            if(form.region.value==="" ||form.mission.value==="" || form.objectif.value==="" ||
            form.ttc.value==="" || form.budget_n.value==="" || form.ordonnateur.value==="" )
                {
                return;
            }
        }else if(form.projet && form.type_travaux){
            let categories=["PROJET A GESTION CENTRALE","PROJET A GESTION REGIONALE","PROJET A GESTION COMMUNALE"]
            let typeTravaux=["ROUTE EN TERRE","ROUTE BITUMÉE","OUVRAGE D'ART"]

            if(form.projet.value==="" ||form.region.value==="" || !typeTravaux.includes(form.type_travaux.value)  || !categories.includes(form.categorie.value) ||
            form.ttc.value==="" || form.budget_n.value==="" || form.observation.value==="")
            {
                return;
            }
            if(form.departement && form.departement.value==="" ){
                return;
            }
            if(form.commune && form.commune.value==="" ){
                return;
            }
        }
        
        setPageLoader(true)
        modalBox.current.setModal(false)

        let formData =new FormData(form);
        let datas=Object.fromEntries(formData)

        try{

            let res= await Fetch(`addProjetToProgramme${programme.ordonnateur}/${id}`,"POST",datas)
            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){
                    
                    let response = await fetchGet(`programme/${id}`)
                    if(response.ok){
                        let resdata= await response.json()
                        
                        setProgramme(resdata)
                        projet.current=resdata.projetList
                        if(resdata.ordonnateur==="MINTP"){

                            if(categorie==="CENTRALE"){
                                setData(resdata.projetList.filter(i=>(i.categorie!=="PROJET A GESTION COMMUNALE") ))
                            }else{
                                setData(resdata.projetList.filter(i=>(i.categorie==="PROJET A GESTION COMMUNALE") ))
                            }

                        }else if(resdata.ordonnateur==="MINT"){

                            setData(resdata.projetList.filter(i=>( i.ordonnateur===categorie)))
                        }
                        else{
                            setData(resdata.projetList)
                        }
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

    const updateProjet=async (e,id)=>{

        e.preventDefault()
        let form=e.target

        if(form.ville && form.ordonnateur){

            if(form.region.value==="" ||form.ville.value==="" || form.troçon.value==="" ||
                form.ttc.value==="" || form.budget_n.value==="" || form.ordonnateur.value==="" )
            {
            return;
            }
        }else if(form.mission && form.objectif){

            if(form.region.value==="" ||form.mission.value==="" || form.objectif.value==="" ||
            form.ttc.value==="" || form.budget_n.value==="" || form.ordonnateur.value==="" )
                {
                return;
            }
        }else if(form.projet && form.type_travaux){
            let categories=["PROJET A GESTION CENTRALE","PROJET A GESTION REGIONALE","PROJET A GESTION COMMUNALE"]
            let typeTravaux=["ROUTE EN TERRE","ROUTE BITUMÉE","OUVRAGE D'ART"]

            if(form.projet.value==="" ||form.region.value==="" || !typeTravaux.includes(form.type_travaux.value) || !categories.includes(form.categorie.value) ||
            form.ttc.value==="" || form.budget_n.value==="" || form.observation.value==="")
            {
                return;
            }
            if(form.departement && form.departement.value==="" ){
                return;
            }
            if(form.commune && form.commune.value==="" ){
                return;
            }
        }
        
        setPageLoader(true)
        modalBox.current.setModal(false)

        let formData =new FormData(form);
        let datas=Object.fromEntries(formData)

        try{

            let res= await Fetch(`updateProjet${programme.ordonnateur}/${id}`,"PUT",datas)
            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){
                    
                    let index= data.indexOf(data.find(i=>i.id===id))
                    datas.id=id
                    datas.suivi=data[index].suivi
                    datas.suiviTravaux=data[index].suiviTravaux
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
        modal1.current.setModal(false)

        try{
            let res= await Fetch(`deleteReportProjet/${id}`,"DELETE")
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

    const changeTable=(e,i)=>{

        let li=e.target
        setCategorie(i)
        setStatut("Traitment DCO")
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

    const handleClick=(id)=>{ 

        let projet=data.find(i=>i.id===id)
        setState({function:updateProjet, data:projet})
        modalBox.current.setModal(true)
    }

    const deleteModal=(id)=>{
        setDeleteId(id)
        modal1.current.setModal(true)
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
    
    const open=(id)=>{
        setStatut("Traitment DCO")
        setProjetId(id)
        modal.current.setModal(true) 
    }

    const openForm=()=>{
        setState({function:saveProjet})
        modalBox.current.setModal(true)
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

            if(categorie==="CENTRALE"){

                data=projet.current.filter(i=>i.categorie!=="PROJET A GESTION COMMUNALE")
                key=["region","budget_n","categorie","code_route","prestataire"]
    
            }else{
    
                data=projet.current.filter(i=>i.categorie==="PROJET A GESTION COMMUNALE")
                key=["region","departement","commune","budget_n","code_route","prestataire"]
        
            }
        }

        return ({data:data, key: key})
        
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
                    <SearchBar data={searchChoose(ordonnateur).data} keys={searchChoose(ordonnateur).key} onSetData={setData} />
                </div>
            </div>

            <div className="box slide">
                <div id="pg-title" className="mb-25">
                    <h1>{programme.intitule}</h1>
                    {(["CO","DCO"].includes(role) && programme.type==="REPORT") &&(
                        <div className="snd-step">
                            <div className="check-update">
                                <label htmlFor="check">Modifier</label>
                                <input type="checkbox" id="check" onChange={(e)=>setCheck(e.target.checked)} />
                            </div>
                            <div className="n-projet">
                                <button onClick={openForm}>Nouveau projet</button>
                            </div>
                        </div>
                    )}
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
                {programme.ordonnateur==="MINT" &&(   
                    <div className="top-element s-change">
                        <ul>
                            <li className="active" onClick={(e)=>changeMINT(e,"MINT")} >Gestion centrale</li>
                            <li onClick={(e)=>changeMINT(e,"MAIRE")}>Gestion communale</li>
                        </ul>
                    </div>
                )}
                
                
                {ordonnateur==="MINHDU"?

                    <TableMINHDU data={data} programme={programme} report={{check:check,update: handleClick,delete:deleteModal}} onLoadPdf={loadPdf} onHandleClick={open} />

                :ordonnateur==="MINT"?

                    <TableMINT data={data} programme={programme} report={{check:check,update: handleClick,delete:deleteModal}} categorie={categorie} onLoadPdf={loadPdf} onHandleClick={open} />

                :  
                    <TableMINTP data={data} programme={programme} report={{check:check,update: handleClick,delete:deleteModal}} categorie={categorie}  onLoadPdf={loadPdf} onHandleClick={open} />

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

            {role==="DCO" &&(
                <div className="p-sub" style={{marginBottom:"30px"}}>
                    <p>Vous ne pourrez plus travailler sur ce programme lorsqu'il sera cloturé.</p>
                    <button onClick={()=>cloture(id)}>CLOTURER</button>
                </div>   
            )}  
            

            <ModalBox ref={modalBox}>
                {programme.ordonnateur==="MINHDU"?

                <FormMINHDU title={programme.intitule} annee={programme.annee} body={state}/>

                :programme.ordonnateur==="MINTP"?

                <FormMINTP title={programme.intitule} categorie={categorie} annee={programme.annee} body={state}/>

                :programme.ordonnateur==="MINT"?

                <FormMINT title={programme.intitule} annee={programme.annee} body={state}/>

                :<></>
                }
            </ModalBox>

            <ModalBox ref={modal}>
                <form className="flex-form" encType="multipart/form-data" onSubmit={submit} >
                    <div>
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line" >
                            <label>Situation <span>*</span></label>
                            <select name="statut" onChange={(e)=>setStatut(e.target.value)} required >
                                <option value="Traitment DCO">Traitment DCO</option>
                                <option value="Traitement DAF">Traitement DAF</option>
                                <option value="En attente pour correction">En attente pour corrections</option>
                                <option value="Rejeté">Rejeté</option>
                                <option value="Transmis pour visa">Transmis pour visa</option>
                                <option value="Visé">Visé</option>
                            </select>
                        </div>

                        {statut==="Rejeté" || statut==="En attente pour correction"?
                        <>
                            <div className="form-line">
                                <label>Motifs <span>*</span></label>
                                <Select options={Rejet}  placeholder="motif" onChange={setMotif} isMulti className="multi-select" />
                            </div> 
                            <div className="form-line">
                                <label>Autres motifs</label>
                                <input type="text" id="other" />
                            </div> 
                        </>
                        
                        
                        :<></>
                       
                        }
                        {statut==="Transmis pour visa" &&(
                            <>
                            <div className="form-line">
                                <label>Engagement <span>*</span></label>
                                <input type="number" name="engagement"  min="0" required />
                            </div> 
                            <div className="form-line">
                                <label>Prestataire <span>*</span></label>
                                <input type="text" defaultValue={data.find(i=>i.id===projetId).prestataire} name="prestataire" required/>
                            </div>
                            </>     
                        )}

                        {statut==="Visé" &&(
                            <div className="form-line">
                                <label>page du contrat (2MB MAX) <span>*</span></label>
                                <input type="file" name="file" accept=".pdf" required />
                            </div> 
                        )}
                        
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div>     
                </form>
            </ModalBox>

            <ModalBox ref={modal1}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer ce projet?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={()=>deleted(deleteId)}>OUI</button>
                        <button className="b-btn" onClick={()=>{modal1.current.setModal(false)}}>NON</button>
                    </div>
                </div>
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

export default SuiviProgramme;


const TableMINHDU=({data,programme,report,onLoadPdf,onHandleClick})=>{

    let totalB=totalBudget(data)
    let totalE=totalEngagement(data)

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
                        <th className="min-w4">Situation</th>
                        <th className="min-w1">Motifs eventuels</th>
                        <th className="min-w4">suivi Travaux</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((i,j)=>
                        <tr key={j} onDoubleClick={focusLine} >
                            <td>{j+1}</td>
                            <td>{i.region.replaceAll("_","-")}</td>
                            <td>{i.ville}</td>
                            <td>{i.type_travaux}</td>
                            <td>{i.troçon}</td>
                            <td className="end">{numStr(i.lineaire)}</td>
                            <td className="end">{numStr(i.ttc)}</td>
                            <td className="end" >{numStr(i.budget_anterieur)}</td>
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
                                    i.bordereau?
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
                            <td>{(i.bordereau) && 
                                <Link to={`/execution-des-programme/projet/${i.id}/suivi-des-travaux`}>Détails</Link>
                                }
                            </td>
                            <td>
                                <div className="flex-align">
                                    <i className="fa-solid fa-circle-plus i-circle" onClick={()=>onHandleClick(i.id)}></i>
                                    {report.check &&(
                                    <div className="t-action">
                                        <i className="fa-solid fa-pen-to-square" onClick={()=>report.update(i.id)}></i>
                                        <i className="fa-solid fa-trash-can" onClick={()=>report.delete(i.id)}></i>
                                    </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}

                    <tr className="t-line">
                        <td colSpan="8" > Total</td>
                        <td className="end">{numStr(totalB)}</td>
                        <td className="end">{numStr( totalE ,0)}</td>
                        <td className="end">{numStr(totalB-totalE , 0)}</td>
                        <td colSpan="8">
                        </td>
                    </tr>

                    {programme.type!=="REPORT"&&(
                    <tr>
                        <td colSpan="8">Provision de réserve</td>
                        <td className="end">{numStr(programme.prevision,0)}</td>
                        <td className="end">{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td className="end">{numStr(programme.prevision-totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td colSpan="8">
                            <Link to={`/execution-des-programme/programme-MINHDU/${programme.id}/prévision`} >Détails</Link>
                        </td>
                    </tr>  
                    )}
                    
                </tbody>
            </table>
        </div>
    )
}

const TableMINT=({data,programme,report,categorie,onLoadPdf,onHandleClick})=>{

    let totalB=totalBudget(data)
    let totalE=totalEngagement(data)

    return(

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
                        <th className="min-w1">Motifs eventuels</th>
                        <th className="min-w4">suivi Travaux</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody> 
                {data.map((i,j)=>
                    <tr key={j} onDoubleClick={focusLine}>
                        <td>{j+1}</td>
                        <td>{i.region.replaceAll("_","-")}</td>
                        {categorie==="MAIRE" &&(
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
                        <td className="end">{i.suivi && numStr(i.suivi.engagement)}</td>
                        <td className="end">{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                        <td>{i.prestataire}</td>
                        <td className="end">{numStr(i.budget_n1,"")}</td>
                        <td className="end">{numStr(i.budget_n2,"")}</td>
                        <td>{i.ordonnateur}</td>
                        <td>{i.observation}</td>
                        <td>
                            {i.suivi &&(
                                i.bordereau?
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
                        <td>{(i.bordereau) && 
                            <Link to={`/execution-des-programme/projet/${i.id}/suivi-des-travaux`}>Détails</Link>
                            }
                        </td>                      
                        <td>
                            <div className="flex-align">
                                <i className="fa-solid fa-circle-plus i-circle" onClick={()=>onHandleClick(i.id)}></i>
                                {report.check &&(
                                <div className="t-action">
                                    <i className="fa-solid fa-pen-to-square" onClick={()=>report.update(i.id)}></i>
                                    <i className="fa-solid fa-trash-can" onClick={()=>report.delete(i.id)}></i>
                                </div>
                                )}
                            </div>                      
                        </td>
                    </tr>
                    )}

                    <tr className="t-line">
                        <td colSpan={categorie==="MINT"?"7":"9"} > Total</td>
                        <td className="end">{numStr(totalB)}</td>
                        <td className="end">{numStr( totalE ,0)}</td>
                        <td className="end">{numStr(totalB-totalE , 0)}</td>
                        <td colSpan="8">
                        </td>
                    </tr>

                    {programme.type!=="REPORT"&&(
                    <tr>
                        <td colSpan={categorie==="MINT"?"7":"9"}>Provision de réserve</td>
                        <td className="end">{numStr(programme.prevision,0)}</td>
                        <td className="end">{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td className="end">{numStr(programme.prevision-totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td colSpan="8">
                            <Link to={`/execution-des-programme/programme-MINT/${programme.id}/prévision`} >Détails</Link>
                        </td>
                    </tr>
                    )}
                    
                </tbody>
            </table>
        </div>
    )
}

const TableMINTP=({data,programme,report,categorie,onLoadPdf,onHandleClick})=>{

    let totalB=totalBudget(data)
    let totalE=totalEngagement(data)

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                <tr>
                    <th>N°</th>
                    <th>Région</th>
                    {categorie==="COMMUNE" &&(
                    <>
                        <th>Département</th>
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
                    <th className="min-w1">Motifs eventuels</th>
                    <th className="min-w4">Suivi Travaux</th>
                    <th></th>
                </tr>
            </thead>
                <tbody> 
                {data.map((i,j)=>
                        <tr key={j} onDoubleClick={focusLine} >
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
                                    i.bordereau?
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
                            <td>{(i.bordereau) && 
                                <Link to={`/execution-des-programme/projet/${i.id}/suivi-des-travaux`}>Détails</Link>
                                }
                            </td>                          
                            <td>
                                <div className="flex-align">
                                    <i className="fa-solid fa-circle-plus i-circle" onClick={()=>onHandleClick(i.id)}></i>
                                    {report.check &&(
                                    <div className="t-action">
                                        <i className="fa-solid fa-pen-to-square" onClick={()=>report.update(i.id)}></i>
                                        <i className="fa-solid fa-trash-can" onClick={()=>report.delete(i.id)}></i>
                                    </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}

                    <tr className="t-line">
                        <td colSpan={categorie==="CENTRALE"?"9":"11"} > Total</td>
                        <td className="end">{numStr(totalB)}</td>
                        <td className="end">{numStr( totalE ,0)}</td>
                        <td className="end">{numStr(totalB-totalE , 0)}</td>
                        <td colSpan="7">
                        </td>
                    </tr>

                    {programme.type!=="REPORT"&&(
                    <tr>
                        <td colSpan={categorie==="CENTRALE"?"9":"11"} >Provision de réserve</td>
                        <td className="end">{numStr(programme.prevision,0)}</td>
                        <td className="end">{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td className="end">{numStr(programme.prevision-totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)}</td>
                        <td colSpan="7">
                            <Link to={`/execution-des-programme/programme-MINTP/${programme.id}/prévision`} >Détails</Link>
                        </td>
                    </tr>
                    )}
                    
                </tbody>
            </table>
        </div>
    )
}