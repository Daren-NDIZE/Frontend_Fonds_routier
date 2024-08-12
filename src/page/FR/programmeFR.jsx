import { useRef,useState,useEffect } from "react"
import ModalBox from "../../component/modalBox"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import Notification from "../../component/notification"
import PageLoader from "../../component/pageLoader"
import { useNavigate, useParams } from "react-router-dom"
import { Fetch, fetchFormData, fetchGet} from "../../config/FetchRequest"
import { numStr, totalBudget } from "../../script"
import { downLoadExcel } from "jsxtabletoexcel"
import FormMINHDU from "../../component/formMINHDU"
import FormMINT from "../../component/formMINT"
import FormMINTP from "../../component/formMINTP."

function ProgrammeFR({role}){

    let modal=useRef()
    let modal1=useRef()
    let modalBox=useRef()
    let notification=useRef()
    let projet=useRef([])

    let [programme,setProgramme]=useState({})
    let [valide,setValide]=useState(false)
    let [loader,setLoader]=useState(true)
    let [pageLoader,setPageLoader]=useState()
    let [categorie,setCategorie]=useState("CENTRALE")
    let [data,setData]=useState([])
    let [state,setState]=useState({})
    let [deleteId,setDeleteId]=useState()
    let [check,setCheck]=useState(false)


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
                    let statuts=["SOUMIS","REJETER","CORRECTION"]
                    let resData= await res.json()

                    if(resData.type==="erreur" || !statuts.includes(resData.statut)){
                        navigate(-1)
                    }else{
                        setProgramme(resData)
                        projet.current=resData.projetList
                        if(resData.ordonnateur==="MINTP"){
                            setData(resData.projetList.filter(i=>i.categorie!=="PROJET A GESTION COMMUNALE"))
                            return;                  
                        }
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
        modal.current.setModal(false)
        setPageLoader(true)

        let value=["VALIDER","REJETER","CORRECTION"]
        let form=e.target

        if(!value.includes(form.statut.value))
        {
            return;
        }

        let formData =new FormData(form);
    
        try{
            let res= await fetchFormData(`decideProgramme/${id}`,"PUT",formData)
            if(res.ok){
                let resData= await res.json()
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                if(resData.type==="succes"){
                    window.setTimeout(()=>{
                        navigate("/programmes/soumis")
                    },3000)
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
                            setData(resdata.projetList.filter(i=>i.categorie!=="PROJET A GESTION COMMUNALE"))
                        }else{
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

    const handleClick=(id)=>{ 

        let projet=data.find(i=>i.id===id)
        setState({function:updateProjet, data:projet})
        modalBox.current.setModal(true)
    }

    const checked=(e)=>{
        setCheck(e.target.checked)
    }

    const deleteModal=(id)=>{
        setDeleteId(id)
        modal1.current.setModal(true)
    }

    const open=()=>{
        setValide(false)
        modal.current.setModal(true)
    }

    const openForm=()=>{
        setState({function:saveProjet})
        modalBox.current.setModal(true)
    }

    const decision=(e)=>{
        
        let value=e.target.value
        if(value==="VALIDER"){
            setValide(true)

        }else{
            setValide(false)
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
                <div id="pg-title" className="suivi-pg"  style={programme.ordonnateur==="MINTP"?{paddingBottom:"0px"}:{}}>
                    <div>
                        <h1>{programme.intitule}</h1>
                    </div>
                    {(["CO","DCO"].includes(role) && programme.type==="REPORT") &&(
                        <div className="snd-step">
                            <div className="check-update">
                                <label htmlFor="check">Modifier</label>
                                <input type="checkbox" id="check" onChange={checked} />
                            </div>
                            <div className="n-projet">
                                <button onClick={openForm}>Nouveau projet</button>
                            </div>
                        </div>
                    )}
                    

                    {(["CO","DCO"].includes(role) && programme.statut==="SOUMIS") &&(
                    <div className="n-projet mr-10">
                        <button onClick={open} >Decision</button>
                    </div>
                    )}
                        
                    <button className="download-btn" onClick={()=>exportExcel(programme.intitule)}>
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

                    <TableMINHDU data={data} annee={programme.annee} check={check} onHandleClick={handleClick} onForm={deleteModal}/>
                        
                :programme.ordonnateur==="MINT"?

                    <TableMINT data={data} annee={programme.annee} check={check} onHandleClick={handleClick} onForm={deleteModal}/>
                        
                :
                    <TableMINTP data={data} categorie={categorie} annee={programme.annee} check={check} onHandleClick={handleClick} onForm={deleteModal}/>

                }
               
            </div>

            {programme.ordonnateur==="MINHDU"?

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
                        <p>{numStr(programme.prevision,0)} fcfa
                        </p>
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

            <ModalBox ref={modal}>
                <form encType="multipart/form-data"  className="flex-form"  onSubmit={submit}>
                    <div>
                        <div className="form-line">
                            <label>Décision <span>*</span></label>
                            <select name="statut" onChange={decision} required>
                                <option value="">- - - - - - - - - - - - - - - - - -</option>
                                <option value="VALIDER">VALIDER</option>
                                <option value="REJETER">REJETER</option>
                                <option value="CORRECTION">RENVOYER POUR CORRECTION</option>
                            </select>                        
                        </div>
                        <div className="form-line">
                            <label>Observation</label>
                            <textarea name="observation"/>
                        </div>
                        {valide &&(
                            <div className="form-line">
                                <label>Résolution signée (2MB MAX) <span>*</span></label>
                                <input type="file" name="file"  accept=".pdf" required/>
                            </div>
                        )}
                        
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div>     
                </form>
            </ModalBox>

            {programme.ordonnateur==="MINHDU"?
    
                <ModalBox ref={modalBox}>
                    <FormMINHDU title={programme.intitule} annee={programme.annee} body={state}/>
                </ModalBox>
            :programme.ordonnateur==="MINTP"?

                <ModalBox ref={modalBox}>
                    <FormMINTP title={programme.intitule} annee={programme.annee} body={state}/>
                </ModalBox>
            :programme.ordonnateur==="MINT"?
                
                <ModalBox ref={modalBox}>
                    <FormMINT title={programme.intitule} annee={programme.annee} body={state}/>
                </ModalBox>

            :<></>
            }
            <ModalBox ref={modal1}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer ce projet?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={()=>deleted(deleteId)}>OUI</button>
                        <button className="b-btn" onClick={()=>{modal1.current.setModal(false)}}>NON</button>
                    </div>
                </div>
            </ModalBox>
 
            {pageLoader &&(
                <PageLoader/>
            )}
        </div>
    )
}

export default ProgrammeFR


const TableMINHDU=({data,annee,check,onHandleClick,onForm})=>{

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th>Ville</th>
                        <th className="min-w13">Type de travaux</th>
                        <th className="min-w1">Troçons</th>
                        <th>Linéaire_(ml)</th>
                        <th className="min-w4">Budget total TTC</th>
                        <th className="min-w4">Budget antérieur</th>
                        <th className="min-w4">{`Budget ${annee}`}</th>
                        <th className="min-w4">{`Projection ${annee+1}`}</th>
                        <th className="min-w4">{`Projection ${annee+2}`}</th>
                        <th className="min-w3">Prestataire</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w1">Observations</th>
                        {check &&(
                            <th>Action</th>
                        )}
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
                            <td>{numStr(i.lineaire,"")}</td>
                            <td>{numStr(i.ttc,"")}</td>
                            <td>{numStr(i.budget_anterieur,"")}</td>
                            <td>{numStr(i.budget_n, " ") }</td>
                            <td>{numStr(i.budget_n1,"")}</td>
                            <td>{numStr(i.budget_n2,"")}</td>
                            <td>{i.prestataire}</td>
                            <td>{i.ordonnateur}</td>
                            <td>{i.observation}</td>
                            {check &&(
                            <td>
                                <div className="t-action">
                                    <i className="fa-solid fa-pen-to-square" onClick={()=>onHandleClick(i.id)}></i>
                                    <i className="fa-solid fa-trash-can" onClick={()=>onForm(i.id)}></i>
                                </div>
                            </td>
                            
                            )}
                        </tr>
                    )
                    }
                </tbody>
            </table>
        </div>
    )
}

const TableMINT=({data,annee,check,onHandleClick,onForm})=>{

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
                        <th className="min-w4">{`Budget ${annee}`}</th>
                        <th className="min-w4">{`Projection ${annee+1}`}</th>
                        <th className="min-w4">{`Projection ${annee+2}`}</th>
                        <th className="min-w3">Prestataire</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w1">Observations</th> 
                        {check &&(
                            <th>Action</th>
                        )}
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
                            <td>{numStr(i.ttc,"")}</td>
                            <td>{numStr(i.budget_anterieur,"")}</td>
                            <td>{numStr(i.budget_n, " ") }</td>
                            <td>{numStr(i.budget_n1,"")}</td>
                            <td>{numStr(i.budget_n2,"")}</td>
                            <td>{i.prestataire}</td>
                            <td>{i.ordonnateur}</td>
                            <td>{i.observation}</td>
                            {check &&(
                            <td>
                                <div className="t-action">
                                    <i className="fa-solid fa-pen-to-square" onClick={()=>onHandleClick(i.id)}></i>
                                    <i className="fa-solid fa-trash-can" onClick={()=>onForm(i.id)}></i>
                                </div>
                            </td>
                            )}
                        </tr>
                    )}
                    
                </tbody>
            </table>
        </div>
    )
}

const TableMINTP=({data,categorie,annee,check,onHandleClick,onForm})=>{

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
                    <th className="min-w4">Budget {annee}</th>
                    <th className="min-w4">Projection {annee+1}</th>
                    <th className="min-w4">Projection {annee+2}</th>
                    <th className="min-w3">Pretataire</th>
                    <th className="min-w1">Observations</th>
                    {check &&(
                        <th>Action</th>
                    )}
                </tr>
            </thead>
            <tbody>
            {
                data.map((i,j)=>
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
                    <td>{numStr(i.lineaire_route)}</td>
                    <td>{numStr(i.lineaire_oa)}</td>
                    <td>{numStr(i.ttc)}</td>
                    <td >{numStr(i.budget_anterieur)}</td>
                    <td>{numStr(i.budget_n) }</td>
                    <td>{numStr(i.budget_n1)}</td>
                    <td>{numStr(i.budget_n2)}</td>
                    <td>{i.prestataire}</td>
                    <td>{i.observation}</td>  
                    {check &&(
                    <td>
                        <div className="t-action">
                            <i className="fa-solid fa-pen-to-square" onClick={()=>onHandleClick(i.id)}></i>
                            <i className="fa-solid fa-trash-can" onClick={()=>onForm(i.id)}></i>
                        </div>
                    </td>
                    )}  
                </tr>

            )}
                
            </tbody>
        </table>
        </div>
    )
}