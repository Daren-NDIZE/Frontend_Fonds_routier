import ModalBox from "../../component/modalBox";
import SearchBar from "../../component/searchBar";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Fetch, fetchFormData, fetchGet } from "../../config/FetchRequest";
import Loader from "../../component/loader";
import Notification from "../../component/notification";
import PageLoader from "../../component/pageLoader";
import FormMINTP from "../../component/formMINTP.";
import { numStr, totalBudget } from "../../script";
import { downLoadExcel } from "jsxtabletoexcel";
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

function ProgrammeMINTP (){

    let statut=["EN_ATTENTE_DE_SOUMISSION","CORRECTION","REJETER"]
    let categories=["PROJET A GESTION CENTRALE","PROJET A GESTION REGIONALE","PROJET A GESTION COMMUNALE"]

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    let [categorie,setCategorie]=useState("CENTRALE")
    let [programme,setProgramme]=useState({})
    let [data,setData]=useState([])
    let [state,setState]=useState({})
    let [check,setCheck]=useState(false)
    let [deleteId,setDeleteId]=useState()
    let [pdf,setPdf]=useState()


    let [loader,setLoader]=useState(true)
    let[pageLoader,setPageLoader]=useState(false)

    let modal=useRef()
    let modal1=useRef()
    let modal2=useRef()
    let modalBox1=useRef()
    let notification=useRef()
    let projet=useRef([])

    let navigate=useNavigate()
 
    const {id}=useParams()

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

                    console.log(resData.projetList)

                    if(resData.type==="erreur"){
                        navigate(-1)
                    }else{
                        setProgramme(resData)
                        projet.current=resData.projetList.filter(i=>i.financement!=="RESERVE")
                        setData(resData.projetList.filter(i=>(i.financement!=="RESERVE" && i.categorie!=="PROJET A GESTION COMMUNALE") ))
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

        if(form.projet.value==="" ||form.region.value==="" || form.type_travaux.value==="" || !categories.includes(form.categorie.value) ||
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
        
        setPageLoader(true)
        modal.current.setModal(false)
        let formData =new FormData(form);
        let data=Object.fromEntries(formData)

        try{
            let res= await Fetch(`addProjetToProgrammeMINTP/${id}`,"POST",data)
            if(res.ok){
                let resData= await res.json()

                if(resData.type==="succes"){
                    
                    let response = await fetchGet(`programmeByRole/${id}`)
                    if(response.ok){
                        let resdata= await response.json()

                        projet.current=resdata.projetList.filter(i=>i.financement!=="RESERVE")
                        if(categorie==="CENTRALE"){
                            setData(resdata.projetList.filter(i=>(i.financement!=="RESERVE" && i.categorie!=="PROJET A GESTION COMMUNALE") ))
                        }else{
                            setData(resdata.projetList.filter(i=>(i.financement!=="RESERVE" && i.categorie==="PROJET A GESTION COMMUNALE") ))
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

    const update=async (e,id)=>{

        e.preventDefault()
        let form=e.target

        let decision=window.confirm("voulez vous vraiment modifier ce projet?")
        if(!decision){
            modal.current.setModal(false)
            return;
        }

        if(form.projet.value==="" ||form.region.value==="" || form.type_travaux.value==="" || !categories.includes(form.categorie.value) ||
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
        
        setPageLoader(true)
        modal.current.setModal(false)

        let formData =new FormData(form);
        let datas=Object.fromEntries(formData)

        try{
            let res= await Fetch(`updateProjetMINTP/${id}`,"PUT",datas)
            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){
                    let index= data.indexOf(data.find(i=>i.id===id))
                    datas.id=id
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

    const setPrevision= async(e,id)=>{

        e.preventDefault()
        let form=e.target
       
        if(form.prevision.value==="" ){
            return;
        }

        setPageLoader(true)
        modal1.current.setModal(false)

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

    const openModal=()=>{
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

    const searchChoose=(categorie)=>{

        let data
        let key

        if(categorie==="CENTRALE"){
            data=projet.current.filter(i=>i.categorie!=="PROJET A GESTION COMMUNALE")
            key=["region","budget_n","code_route","prestataire"]

            return ({data:data, key: key})

        }else{

            data=projet.current.filter(i=>i.categorie==="PROJET A GESTION COMMUNALE")
            key=["region","departement","commune","budget_n","code_route","prestataire"]

            return ({data:data, key: key})

        }
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

            <div className="box">
                <div id="pg-title">
                    <h1>{programme.intitule}</h1>
                    <button className="download-btn" onClick={()=>exportExcel(programme.intitule)} >
                        <i className="fa-solid fa-down-long"></i>
                    </button>
                </div>
                <div className="top-element">
                    <div>
                        <ul>
                            <li className="active" onClick={(e)=>changeTable(e,"CENTRALE")}>Gestion centrale/regionale</li>
                            <li onClick={(e)=>changeTable(e,"COMMUNE")}>Gestion communale</li>
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
                        <button onClick={openModal}>Nouveau projet</button>
                    </div>
                    )}
                </div>
                
                <div className="tableBox">

                    <table className="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Région</th>
                                {categorie!=="CENTRALE" &&(
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
                                <th>Montant_TTC_projet</th>
                                <th className="min-w4">Budget antérieur</th>
                                <th className="min-w4">Budget {programme.annee}</th>
                                {programme.statut==="VALIDER"&&(
                                <>
                                    <th className="min-w4">Engagement</th>
                                    <th className="min-w4">Reliquat</th>
                                </> 
                                )}
                                <th className="min-w4">Projection {programme.annee+1}</th>
                                <th className="min-w4">Projection {programme.annee+2}</th>
                                <th className="min-w3">Pretataire</th>
                                <th className="min-w1">Observations</th>
                                {programme.statut==="VALIDER"&&(
                                <>
                                    <th className="min-w4">Situation</th>
                                    <th className="min-w1">Motifs</th>
                                    <th className="min-w4">Suivi travaux</th>
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
                                <td>{i.region.replaceAll("_","-")}</td>
                                {categorie!=="CENTRALE" &&(
                                    <>
                                    <td>{i.departement}</td>
                                    <td>{i.commune}</td>
                                    </>
                                )}
                                <td>{i.categorie}</td>
                                <td>{i.projet}</td>
                                <td>{i.code_route}</td>
                                <td>{numStr(i.lineaire_route)}</td>
                                <td>{numStr(i.lineaire_oa)}</td>
                                <td>{numStr(i.ttc)}</td>
                                <td>{numStr(i.budget_anterieur)}</td>
                                <td>{numStr(i.budget_n) }</td>
                                <td>{i.suivi && numStr(i.suivi.engagement)}</td>
                                <td>{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                                <td>{numStr(i.budget_n1)}</td>
                                <td>{numStr(i.budget_n2)}</td>
                                <td>{i.prestataire}</td>
                                <td>{i.observation}</td>
                                <td>
                                {i.suivi &&(
                                    i.bordereau?
                                    <p  onClick={()=>loadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                                    :i.suivi.statut
                                )}
                                </td>
                                <td>{i.suivi && i.suivi.motif}</td>
                                <td>{(i.bordereau) && 
                                    <Link to={`/programmes/projet/${i.id}/suivi-des-travaux`}>Détails</Link>
                                    }
                                </td> 
                            </tr>
                        )
                        :
                        data.map((i,j)=>
                            <tr key={j}>
                                <td>{j+1}</td>
                                <td>{i.region.replaceAll("_","-")}</td>
                                {categorie!=="CENTRALE" &&(
                                    <>
                                    <td>{i.departement}</td>
                                    <td>{i.commune}</td>
                                    </>
                                )}
                                <td>{i.categorie}</td>
                                <td>{i.projet}</td>
                                <td>{i.code_route}</td>
                                <td >{numStr(i.lineaire_route)}</td>
                                <td>{numStr(i.lineaire_oa)}</td>
                                <td>{numStr(i.ttc)}</td>
                                <td>{numStr(i.budget_anterieur)}</td>
                                <td>{numStr(i.budget_n) }</td>
                                <td>{numStr(i.budget_n1)}</td>
                                <td>{numStr(i.budget_n2)}</td>
                                <td>{i.prestataire}</td>
                                <td>{i.observation}</td>
                                {check &&(
                                <td> 
                                    <div className="t-action">
                                        <i className="fa-solid fa-pen-to-square" onClick={()=>handleClick(i.id)} ></i>
                                        <i className="fa-solid fa-trash-can" onClick={()=>deleteModal(i.id)} ></i>
                                    </div>
                                </td>
                                )}
                            </tr>
                        )
                        }


                        {programme.statut==="VALIDER" &&(

                            <tr>
                                <td colSpan={categorie==="CENTRALE"?"9":"11"} >Provision de réserve</td>
                                <td>{numStr(programme.prevision,0)} fcfa</td>
                                <td>{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)} fcfa</td>
                                <td>{numStr(programme.prevision-totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)} fcfa</td>
                                <td colSpan="7">
                                    <Link to={`/programmes/programme-MINTP/${programme.id}/prévision`} >Détails</Link>
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
                        {statut.includes(programme.statut) &&(

                        <i className="fa-solid fa-circle-plus" onClick={()=>modal1.current.setModal(true)}></i>                   

                        )}
                     </div>
                </div>

                {/* <div className="tableBox">
                    <table className="table">
                        <thead>
                            <th>GESTION CENTRALE</th>
                            <th>GESTION REGIONALE</th>
                            <th>GESTION COMMUNALE</th>
                            <th>PREVISION DES RESERVES</th>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{numStr(totalBudget(projet.current.filter(i=>i.categorie==="PROJET A GESTION CENTRALE")),0)} fcfa</td>
                                <td>{numStr(totalBudget(projet.current.filter(i=>i.categorie==="PROJET A GESTION REGIONALE")),0)} fcfa</td>
                                <td>{numStr(totalBudget(projet.current.filter(i=>i.categorie==="PROJET A GESTION COMMUNALE")),0)} fcfa</td>
                                <td>
                                    <div className="p-prevision">
                                    <p>{numStr(programme.prevision,0)} fcfa</p>
                                    {statut.includes(programme.statut) &&(
                                    <i className="fa-solid fa-circle-plus" onClick={()=>modal1.current.setModal(true)}></i>                   
                                    )}
                                    </div>
                                </td>

                                
                            </tr>
                        </tbody>
                        
                    </table>
                </div> */}

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
                <FormMINTP title={programme.intitule} annee={programme.annee} categorie={categorie} body={state}/>
            </ModalBox>

            <ModalBox ref={modal1}>
                <form  className="flex-form" onSubmit={(e)=>setPrevision(e,programme.id)}>
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
            
            <ModalBox ref={modal2}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer ce projet?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={()=>deleted(deleteId)}>OUI</button>
                        <button className="b-btn" onClick={()=>modal2.current.setModal(false)}>NON</button>
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

export default ProgrammeMINTP;




