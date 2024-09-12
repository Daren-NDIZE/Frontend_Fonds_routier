import { useEffect, useState,useRef } from "react";
import SearchBar from "../../component/searchBar";
import { Fetch, fetchFormData, fetchGet} from "../../config/FetchRequest";
import Notification from "../../component/notification";
import Loader from "../../component/loader";
import { numStr } from "../../script";
import { Link } from "react-router-dom";
import ModalBox from "../../component/modalBox";
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import PageLoader from "../../component/pageLoader";

function ValideProgramme({role}){

    let [programme,setProgramme]=useState([])
    let [loader,setLoader]=useState(true)
    let [pageLoader,setPageLoader]=useState()
    let [detail,setDetail]=useState({})
    let [menu,setMenu]=useState(false)
    let [erreur,setErreur]=useState("")
    let [ID, setID]=useState()
    let [pdf,setPdf]=useState()

    let notification=useRef()
    let modalBox=useRef()
    let modalBox1=useRef()
    let modal=useRef()
    let modal1=useRef()

    let annee=new Date().getFullYear() 

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    useEffect(()=>{

        (async function(){

            try{
                const res= await fetchGet("getValidProgramme")

                if(res.ok){
                    const resData= await res.json()
                    setProgramme(resData)
                }
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }
            
        })()

    },[])

    const createReport=async(e)=>{

        e.preventDefault()
        let form=e.target
        let ordonnateur=["MINTP","MINT","MINHDU"]

        if(!form.ordonnateur){
            return;
        }
        if(!ordonnateur.includes(form.ordonnateur.value)){

            setErreur("veuillez remplir correctement les champs")
        }
        
        let formData =new FormData(e.target);
        let data=Object.fromEntries(formData)

        setPageLoader(true)
        modal.current.setModal(false)

        try{  
            const res= await Fetch("saveReportProgramme","POST",data)

            if(res.ok){
                let resData= await res.json()

                if(resData.type ==="succes"){
                    
                    const response= await fetchGet("getValidProgramme")

                    if(response.ok){
                        const resdata= await response.json()
                        setProgramme(resdata)
                    }
                }

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
        setID(id)
        modal1.current.setModal(true)
    }

    const deletedReport= async(id)=>{

        try{

            modal1.current.setModal(false)
            setPageLoader(true)
            const res= await Fetch(`deleteReportProgramme/${id}`,"DELETE")

            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){

                    let data=programme.filter(i=>i.id!==id)
                    setProgramme(data)
                }
                notification.current.setNotification(
                    {visible: true, type:resData.type, message: resData.message}
                )

            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }
        

    }
    
    const details=(id,observation,resolution)=>{

        setDetail({id:id,observation: observation, resolution: resolution})
        modalBox.current.setModal(true)

    }

    const loadPdf=async(id)=>{

        setPdf(null)
        modalBox.current.setModal(false)
        modalBox1.current.setModal(true)
        try{
            let res= await fetchFormData(`programme/getResolution/${id}`,"GET")
            if(res.ok){
                
                let blob = await res.blob()
                const url=window.URL.createObjectURL(blob)
                setPdf(url)
            }
            
        }catch(e){
            console.log(e)
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
                {["CO","DCO"].includes(role) &&(
                <div className="retour-container">
                    <button className="fr-btn" onClick={()=>modal.current.setModal(true)}>REPORT + </button>
                </div>
                )}
                <div className="box b-search">
                    <SearchBar/>
                </div>
            </div>


            {programme.length!==0?

                programme.map((i,j)=>
                
                <div className="box pg-box" key={j}>

                    {( i.type==="REPORT" && ["CO","DCO"].includes(role) ) &&(
                    <div className="pg-hidden" onMouseLeave={()=>setMenu(false)}>
                        <div><i className="fa-solid fa-ellipsis" onClick={()=>setMenu(true)}></i></div>
                        {menu &&(
                            <div className="hidden-menu">
                                <ul>
                                    <li></li>
                                    <li onClick={()=>handleClick(i.id)}>Supprimer</li>

                                </ul>
                            </div>
                        )}     
                    </div>
                    )}

                    <div className="programme-line">
                        <div className="b-col">
                            <div>Intitulé</div>
                            <div><Link to={`/execution-des-programme/programme-${i.ordonnateur}/${i.id}`}>{i.intitule}</Link></div>
                        </div>
                        <div className="b-col">
                            <div>Ordonnateur</div>
                            <div>{i.ordonnateur}</div>
                        </div>
                        <div className="b-col">
                            <div>Année</div>
                            <div>{i.annee}</div>
                        </div>
                        <div className="b-col">
                            <div>Budget total</div>
                            <div> {numStr(i.budget,0) } fcfa</div>
                        </div>
                        <div className="b-col">
                            <div>statut</div>
                            <div>
                                <div className="desc warning">
                                    {i.statut.replaceAll("ER","É")}
                                </div>
                            </div>
                        </div>

                        <div className="b-col">
                            <div>Plus d'info</div>
                            <div>
                                <i className="fa-solid fa-circle-plus" onClick={()=>details(i.id,i.observation, i.url_resolution)} ></i>                   
                            </div>
                        </div> 

                    </div>

                </div>
                
                )
            :
                <div className="vide">
                    Vide
                </div>
            }

            <ModalBox ref={modalBox}>
                <div className="pg-detail">
                    {detail.observation &&(
                    <div className="detail-col">
                        <div>Observation</div>
                        <p>{detail.observation}</p>
                    </div>
                    )}

                    {detail.resolution &&(
                    <div className="detail-col">
                        <div>resolution signée</div>
                        <p className="sign" onClick={()=>loadPdf(detail.id)}>Voir la resolution signée</p>
                    </div>
                    )}
                </div>
            </ModalBox>

            <ModalBox ref={modal}>
                <form className="flex-form" onSubmit={createReport} >
                    <div>
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line">
                            <label>Programme</label>
                            <select name="ordonnateur" required>
                                <option value=""> - - - - - - - - - - - - - - - - - - - - - - - - </option>
                                <option value="MINTP">{`REPORT PROGRAMME MINTP ${annee}`}</option>
                                <option value="MINHDU">{`REPORT PROGRAMME MINHDU ${annee}`}</option>
                                <option value="MINT">{`REPORT PROGRAMME MINT ${annee}`}</option>
                            </select>
                        </div>
                        
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>  
                    </div>
                        
                </form>
            </ModalBox>

            <ModalBox ref={modal1}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer ce programme?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={()=>deletedReport(ID)}>OUI</button>
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

export default ValideProgramme ;