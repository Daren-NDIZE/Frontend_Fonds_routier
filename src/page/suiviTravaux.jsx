import { useEffect, useState,useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Fetch, fetchGet } from "../config/FetchRequest";
import Notification from "../component/notification";
import SearchBar from "../component/searchBar";
import Loader from "../component/loader";
import ModalBox from "../component/modalBox";
import PageLoader from "../component/pageLoader";


function SuiviTravaux({update}){

    let [loader,setLoader]=useState(true)
    let [data,setData]=useState([])
    let [projet,setProjet]=useState({})
    let [pageLoader,setPageLoader]=useState()
    let [erreur,setErreur]=useState("")
    let [check,setCheck]=useState(false)
    let [suiviId,setSuiviId]=useState()
    let [focus,setFocus]=useState({})
    let [state,setState]=useState("PASSATION")

    let notification=useRef()
    let modalBox=useRef()
    let modal1=useRef()
    let modal2=useRef()


    const {id}=useParams()
    const navigate=useNavigate()


    useEffect(()=>{

        (async function(){

            try{
                const res= await fetchGet(`projet/${id}`)

                if(res.ok){
                    const resData= await res.json()
                    setProjet(resData)

                    if(resData.type || !resData.bordereau){
                        navigate(-1)
                    }else{
                        setData(resData.passation)
                    }
                }
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }
            
        })()

    },[id,navigate])


    const submitTravaux=async (e)=>{

        e.preventDefault()
        let form=e.target

        if(erreur.length!==0){
            setErreur("")
        }
    
        if( form.tauxConsommation.value==="" || form.tauxAvancement.value==="" ){

            setErreur("Veuillez remplir tous les champs")
            return;
        }
        if(form.tauxConsommation.value >100 || form.tauxAvancement.value > 100){
            setErreur("les taux doivent être inférieur à 100%")
            return;
        }
        
        let formData =new FormData(form);
        let data=Object.fromEntries(formData)
        modalBox.current.setModal(false)
        setPageLoader(true)

        try{
            let res= await Fetch(`projet/saveSuiviTravaux/${id}`,"POST",data)
            if(res.ok){

                let resData= await res.json()
        
                if(resData.type==="succes"){

                    const response= await fetchGet(`projet/${id}`)

                    if(response.ok){
                        const dataRes= await response.json()
                        setProjet(dataRes)
                        setData(dataRes.suiviTravaux)
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

    const submitPassation=async (e)=>{

        let content=["DAO en cours d'élaboration","DAO en cours d'examen en Commission","AAO lancé avec ouverture des offres",
                     "Accord de gré gré attendu","Offres en cours d'examen","Décision d'attribution signée"]

        e.preventDefault()
        let form=e.target

        if(erreur.length!==0){
            setErreur("")
        }
    
        if( form.numeroMarche.value==="" || form.dateOs.value==="" || !content.includes(form.contractualisation.value)){

            setErreur("Veuillez remplir tous les champs")
            return;
        }
        
        let formData =new FormData(form);
        let data=Object.fromEntries(formData)
        modalBox.current.setModal(false)
        setPageLoader(true)

        try{
            let res= await Fetch(`projet/savePassation/${id}`,"POST",data)

            if(res.ok){

                let resData= await res.json()
        
                if(resData.type==="succes"){

                    const response= await fetchGet(`projet/${id}`)

                    if(response.ok){
                        const dataRes= await response.json()
                        setProjet(dataRes)
                        setData(dataRes.passation)
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

    const updatedTravaux=async (e)=>{

        e.preventDefault()
        let form=e.target

        if(erreur.length!==0){
            setErreur("")
        }
    
        if(form.tauxConsommation.value==="" || form.tauxAvancement.value===""){
            setErreur("Veuillez remplir tous les champs")
            return;
        }
        if(form.tauxConsommation.value >100 || form.tauxAvancement.value > 100){
            setErreur("les taux doivent être inférieur à 100%")
            return;
        }
        
        let formData =new FormData(form);
        let datas=Object.fromEntries(formData)
        modal1.current.setModal(false)
        setPageLoader(true)

        try{
            let res= await Fetch(`projet/updateSuiviTravaux/${suiviId}`,"PUT",datas)
            if(res.ok){

                let resData= await res.json()

                if(resData.type==="succes"){

                    let index=data.indexOf(focus)
                    datas.id=focus.id
                    datas.date=focus.date
                    data[index]=datas
                    setData(data)
                    setProjet(projet=>{
                        projet.suiviTravaux=data;
                        return projet;
                    })
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

    const updatedPassation=async (e)=>{

        let content=["DAO en cours d'élaboration","DAO en cours d'examen en Commission","AAO lancé avec ouverture des offres",
            "Accord de gré gré attendu","Offres en cours d'examen","Décision d'attribution signée"]

        e.preventDefault()
        let form=e.target

        if(erreur.length!==0){
            setErreur("")
        }
    
        if( form.numeroMarche.value==="" || form.dateOs.value==="" || !content.includes(form.contractualisation.value) ){
            setErreur("Veuillez remplir tous les champs")
            return;
        }
        
        let formData =new FormData(form);
        let datas=Object.fromEntries(formData)
        modal1.current.setModal(false)
        setPageLoader(true)

        try{
            let res= await Fetch(`projet/updatePassation/${suiviId}`,"PUT",datas)
            if(res.ok){

                let resData= await res.json()

                if(resData.type==="succes"){

                    let index=data.indexOf(focus)
                    datas.id=focus.id
                    datas.date=focus.date
                    data[index]=datas
                    setData(data)
                    setProjet(projet=>{
                        projet.passation=data;
                        return projet;
                    })
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

    const deletedTravaux=async()=>{

        setPageLoader(true)
        modal2.current.setModal(false)

        try{
            let res= await Fetch(`projet/deleteSuiviTravaux/${suiviId}`,"DELETE")
            if(res.ok){

                let resData= await res.json()
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                if(resData.type==="succes"){
                    let change=data.filter(i=>i.id!==suiviId)
                    setData(change)
                    setProjet(projet=>{
                        projet.suiviTravaux=change
                        return projet
                    })
                }
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }

    }

    const deletedPassation=async()=>{

        setPageLoader(true)
        modal2.current.setModal(false)

        try{
            let res= await Fetch(`projet/deletePassation/${suiviId}`,"DELETE")
            if(res.ok){

                let resData= await res.json()
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                if(resData.type==="succes"){
                    let change=data.filter(i=>i.id!==suiviId)
                    setData(change)
                    setProjet(projet=>{
                        projet.passation=change;
                        return projet;
                    })

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

        setState(i)

        if(i==="TRAVAUX"){
            setData(projet.suiviTravaux)

        }else{
            setData(projet.passation)
        }
       
        if(li.classList.contains("active")){
            return;
        }

        Array.from(li.parentNode.children).forEach(i=>{
            i.classList.remove("active")
        })
        li.classList.add("active")
    }

    const openModal=(id,modal)=>{
        setSuiviId(id)
        if(modal===modal1){
            let suivi=data.find(i=>i.id===id)
            setFocus(suivi)
        }
        modal.current.setModal(true)
    }
    
    if(loader){
        return(
            <Loader/>
        )
    }
    
    return(

        <div className="container">

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
                <div id="pg-title" className="suivi-pg">
                    <div className="top-element">
                        <ul>
                            <li className="active" onClick={(e)=>changeTable(e,"PASSATION")}>Passation</li>
                            <li onClick={(e)=>changeTable(e,"TRAVAUX")}>Travaux</li>
                        </ul>
                    </div>

                    {update &&(
                        <>
                            <div className="check-update">
                                <label htmlFor="check">Modifier</label>
                                <input type="checkbox" id="check" onChange={(e)=>setCheck(e.target.checked)} />
                            </div>
                            <div className="n-projet" >
                                <button onClick={()=>modalBox.current.setModal(true)}>Nouveau</button>
                            </div>
                        </>
                    )}

                </div>
                
                <div className="tableBox">

                    {state==="PASSATION"?
                    
                    <table className="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Date</th>
                                <th className="min-w13">Niveau de contractualisation du projet</th>
                                <th className="min-w4">N° du Marché</th>
                                <th className="min-w4">Date OS  de demarrage</th>
                                
                                {check &&
                                    <th></th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((i,k)=>
                                <tr key={k}>
                                    <td>{k+1}</td>
                                    <td>{new Date(i.date).toLocaleDateString()}</td>
                                    <td>{i.contractualisation}</td>
                                    <td>{i.numeroMarche}</td>
                                    <td>{new Date(i.dateOs).toLocaleDateString()}</td>
                                    {check &&
                                    <td>
                                        <div className="t-action">
                                            <i className="fa-solid fa-pen-to-square" onClick={()=>openModal(i.id,modal1)}></i>
                                            <i className="fa-solid fa-trash-can" onClick={()=>openModal(i.id,modal2)} ></i>
                                        </div>
                                    </td>
                                    
                                    }
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    :
                      
                    <table className="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Date</th>
                                <th>Taux de consommation</th>
                                <th>Taux d'avancement</th>
                                <th className="min-w1">Contraintes/Difficultés éventuelles</th>
                                <th className="min-w12">Propositions de solutions</th>
                                {check &&
                                    <th></th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((i,k)=>
                                <tr key={k}>
                                    <td>{k+1}</td>
                                    <td>{new Date(i.date).toLocaleDateString()}</td>
                                    <td>{i.tauxConsommation} %</td>
                                    <td>{i.tauxAvancement} %</td>
                                    <td>{i.description}</td>
                                    <td>{i.proposition}</td>
                                    {check &&
                                    <td>
                                        <div className="t-action">
                                            <i className="fa-solid fa-pen-to-square" onClick={()=>openModal(i.id,modal1)}></i>
                                            <i className="fa-solid fa-trash-can" onClick={()=>openModal(i.id,modal2)} ></i>
                                        </div>
                                    </td>
                                    
                                    }
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    }
                    
                </div>
            </div>

            
            <ModalBox ref={modalBox} >

                {state==="TRAVAUX"?

                    <form className="flex-form" onSubmit={submitTravaux}>

                        <div>  
                            {erreur.length!==0 &&(
                                <p className="error-msg">{erreur}</p>
                            )} 
                            
                            <div className="form-line">
                                <label>Taux de consommation des délais  (en %) <span>*</span></label>
                                <input type="number" step="any" max="100" name="tauxConsommation" required/>
                            </div>
                            
                            <div className="form-line">
                                <label>Taux d'avancement des travaux (en %) <span>*</span></label>
                                <input type="number" step="any" max="100" name="tauxAvancement" required/>
                            </div>
                            <div className="form-line">
                                <label>Contraintes/Difficultés éventuelles </label>
                                <textarea name="description" />
                            </div>
                            <div className="form-line">
                                <label>Proposition de solutions </label>
                                <textarea name="proposition" />
                            </div>
                            <div className="form-line" style={{margin: "0"}}>
                                <button type="submit">Enregistrer</button>
                            </div>
                        </div> 

                    </form>
                :
                    <form className="flex-form" onSubmit={submitPassation}>

                        <div>  
                            {erreur.length!==0 &&(
                                <p className="error-msg">{erreur}</p>
                            )} 
                            <div className="form-line">
                                <label>Niveau de contractualisation du projet <span>*</span></label>
                                <select name="contractualisation" required>
                                    <option value="">- - - - - - - - - - - - - - - - - - - - - - - -  </option>
                                    <option value="DAO en cours d'élaboration">DAO en cours d'élaboration</option>
                                    <option value="DAO en cours d'examen en Commission">DAO en cours d'examen en Commission</option>
                                    <option value="AAO lancé avec ouverture des offres">AAO lancé avec ouverture des offres</option>
                                    <option value="Accord de gré gré attendu">Accord de gré gré attendu</option>
                                    <option value="Offres en cours d'examen">Offres en cours d'examen</option>
                                    <option value="Décision d'attribution signée">Décision d'attribution signée</option>
                                </select>
                            </div>
                            <div className="form-line">
                                <label>Numéro du marché <span>*</span></label>
                                <input type="text" step="any" name="numeroMarche" required/>
                            </div>
                            <div className="form-line">
                                <label>Date de notification de l'OS de démarrage <span>*</span></label>
                                <input type="date" name="dateOs" max={new Date().toISOString().split("T")[0]} required/>
                            </div>
                           
                            <div className="form-line" style={{margin: "0"}}>
                                <button type="submit">Enregistrer</button>
                            </div>

                        </div>
                    
                    </form>
                }
                
            </ModalBox>


            <ModalBox ref={modal1} >

                {state==="TRAVAUX"?

                    <form className="flex-form" onSubmit={updatedTravaux} >

                        <div>  
                            {erreur.length!==0 &&(
                                <p className="error-msg">{erreur}</p>
                            )} 
                            
                            <div className="form-line">
                                <label>Taux de consommation des délais   (en %) <span>*</span></label>
                                <input type="number" step="any" max="100" name="tauxConsommation" defaultValue={focus.tauxConsommation} required/>
                            </div>
                 
                            <div className="form-line">
                                <label>Taux d'avancement des travaux (en %) <span>*</span></label>
                                <input type="number" step="any" max="100" name="tauxAvancement" defaultValue={focus.tauxAvancement} required/>
                            </div>

                            <div className="form-line">
                                <label>Contraintes/Difficultés éventuelles </label>
                                <textarea name="description" defaultValue={focus.description} />
                            </div>
                            <div className="form-line">
                                <label>Proposition de solutions </label>
                                <textarea name="proposition" defaultValue={focus.proposition} />
                            </div>
                            <div className="form-line" style={{margin: "0"}}>
                                <button type="submit">Enregistrer</button>
                            </div>

                        </div>

                    </form>

                :
                    <form className="flex-form" onSubmit={updatedPassation} >

                        <div>  
                            {erreur.length!==0 &&(
                                <p className="error-msg">{erreur}</p>
                            )} 
                            <div className="form-line">
                                <label>Niveau de contractualisation du projet <span>*</span></label>
                                <select name="contractualisation" defaultValue={focus.contractualisation} required>
                                    <option value="">- - - - - - - - - - - - - - - - - - - - - - - -  </option>
                                    <option value="DAO en cours d'élaboration">DAO en cours d'élaboration</option>
                                    <option value="DAO en cours d'examen en Commission">DAO en cours d'examen en Commission</option>
                                    <option value="AAO lancé avec ouverture des offres">AAO lancé avec ouverture des offres</option>
                                    <option value="Accord de gré gré attendu">Accord de gré gré attendu</option>
                                    <option value="Offres en cours d'examen">Offres en cours d'examen</option>
                                    <option value="Décision d'attribution signée">Décision d'attribution signée</option>
                                </select>
                            </div>
                            <div className="form-line">
                                <label>Numéro du marché <span>*</span></label>
                                <input type="text" step="any" name="numeroMarche" defaultValue={focus.numeroMarche} required/>
                            </div>
                            <div className="form-line">
                                <label>Date de notification de l'OS de démarrage <span>*</span></label>
                                <input type="date" name="dateOs" defaultValue={focus.dateOs?new Date(focus.dateOs).toISOString().split("T")[0]:""} max={new Date().toISOString().split("T")[0]} required/>
                            </div>
            
                            <div className="form-line" style={{margin: "0"}}>
                                <button type="submit">Enregistrer</button>
                            </div>
                        </div>

                    </form>

                }
                
            </ModalBox>


            <ModalBox ref={modal2}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer cet élément?</p>
                    <div className="mb-content">

                        {state==="TRAVAUX"?
                            <button className="s-btn" onClick={deletedTravaux}>OUI</button>
                        :
                            <button className="s-btn" onClick={deletedPassation}>OUI</button>
                        }

                        <button className="b-btn" onClick={()=>modal2.current.setModal(false)}>NON</button>

                    </div>
                </div>
            </ModalBox>

            {pageLoader &&(
                <PageLoader/>
            )}

        </div>
    )
}

export default SuiviTravaux;