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
    let [pageLoader,setPageLoader]=useState()
    let [erreur,setErreur]=useState("")
    let [check,setCheck]=useState(false)
    let [suiviId,setSuiviId]=useState()
    let [focus,setFocus]=useState({})

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

                    if(resData.type || !resData.bordereau){
                        navigate(-1)
                    }else{
                        setData(resData.suiviTravaux)
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

        if(erreur.length!==0){
            setErreur("")
        }
    
        if(form.tauxConsommation.value==="" || form.tauxAvancement.value==="" || form.description.value===""){
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

    const updated=async (e)=>{

        e.preventDefault()
        let form=e.target

        if(erreur.length!==0){
            setErreur("")
        }
    
        if(form.tauxConsommation.value==="" || form.tauxAvancement.value==="" || form.description.value===""){
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

                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
        
                if(resData.type==="succes"){

                    let index=data.indexOf(focus)
                    datas.id=focus.id
                    datas.date=focus.date
                    data[index]=datas
                    setData(data)
                }

            }

        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }

    }

    const deleted=async()=>{

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
                    
                    setData(data=>data.filter(i=>i.id!==suiviId))
                }
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }

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
                    <div>
                        <h1>Suivi des travaux</h1>
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
                    <table className="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Date</th>
                                <th>Taux de consommation</th>
                                <th>Taux d'avancement</th>
                                <th className="min-w12">Observation</th>
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
                </div>
            </div>

            
            <ModalBox ref={modalBox} >
                <form className="flex-form" onSubmit={submit}>
                    
                    <div>   
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line">
                            <label>Taux de consommation des délais   (en %) <span>*</span></label>
                            <input type="number" step="any" max="100" name="tauxConsommation" required/>
                        </div>
                        <div className="form-line">
                            <label>Taux d'avancement des travaux (en %) <span>*</span></label>
                            <input type="number" step="any" max="100" name="tauxAvancement" required/>
                        </div>
                        <div className="form-line">
                            <label>Observation <span>*</span></label>
                            <textarea name="description" required/>
                        </div>
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div> 
                </form>
            </ModalBox>

            <ModalBox ref={modal1} >

                <form className="flex-form" onSubmit={updated} >
                    <div>   
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line">
                            <label>Taux de consommation des délais (en %) <span>*</span></label>
                            <input type="number" step="any" max="100" name="tauxConsommation" defaultValue={focus.tauxConsommation} required/>
                        </div>
                        <div className="form-line">
                            <label>Taux d'avancement des travaux (en %) <span>*</span></label>
                            <input type="number" step="any" max="100" name="tauxAvancement" defaultValue={focus.tauxAvancement} required/>
                        </div>
                        <div className="form-line">
                            <label>Observation <span>*</span></label>
                            <textarea name="description" defaultValue={focus.description} required/>
                        </div>
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div> 
                </form>
            </ModalBox>

            <ModalBox ref={modal2}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer ce payement?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={deleted}>OUI</button>
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