import { useEffect, useState,useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Fetch, fetchGet } from "../config/FetchRequest";
import Notification from "../component/notification";
import SearchBar from "../component/searchBar";
import Loader from "../component/loader";
import ModalBox from "../component/modalBox";
import PageLoader from "../component/pageLoader";


function SuiviTravaux({}){

    let [loader,setLoader]=useState(true)
    let [data,setData]=useState([])
    let [pageLoader,setPageLoader]=useState()
    let [erreur,setErreur]=useState("")

    let notification=useRef()
    let modalBox=useRef()

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
                <div className="tableBox">
                <div id="pg-title" className="suivi-pg">
                    <div>
                        <h1>Suivi des travaux</h1>
                    </div>
                    <div className="n-projet" >
                        <button onClick={()=>modalBox.current.setModal(true)}>Nouveau</button>
                    </div>
                </div>
                    <div className="tableBox">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>Date</th>
                                    <th>Taux de consommation</th>
                                    <th>Taux d'avancement</th>
                                    <th>Observation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((i,k)=>
                                    <tr key={k}>
                                        <td>{k+1}</td>
                                        <td>{new Date(i.date).toLocaleDateString()}</td>
                                        <td>{i.tauxConsommation} %</td>
                                        <td>{i.tauxAvancement} %</td>
                                        <td className="min-w12">{i.description}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            
            <ModalBox ref={modalBox} >
                <form className="flex-form" onSubmit={submit}>
                    
                    <div>   
                        {/* {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )} */}
                        <div className="form-line">
                            <label>Taux de consommation (en %)</label>
                            <input type="number" step="any" name="tauxConsommation" required/>
                        </div>
                        <div className="form-line">
                            <label>Taux d'avancement (en %)</label>
                            <input type="number" step="any" name="tauxAvancement" required/>
                        </div>
                        <div className="form-line">
                            <label>Observation</label>
                            <textarea name="description" required/>
                        </div>
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div> 
                </form>
            </ModalBox>

            {pageLoader &&(
                <PageLoader/>
            )}

        </div>
    )
}

export default SuiviTravaux;