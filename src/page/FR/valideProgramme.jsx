import { useEffect, useState,useRef } from "react";
import SearchBar from "../../component/searchBar";
import { fetchFormData, fetchGet} from "../../config/FetchRequest";
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

function ValideProgramme(){

    let [programme,setProgramme]=useState([])
    let [loader,setLoader]=useState(true)
    let [detail,setDetail]=useState({})
    let [pdf,setPdf]=useState()

    let notification=useRef()
    let modalBox=useRef()
    let modalBox1=useRef()

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

            <div className="box b-search">
                <SearchBar/>
            </div>

            {programme.length!==0?

                programme.map((i,j)=>
                
                <div className="box pg-box" key={j}>

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
                            <div> {numStr(i.budget, " ") } fcfa</div>
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

        </div>
    )
}

export default ValideProgramme ;