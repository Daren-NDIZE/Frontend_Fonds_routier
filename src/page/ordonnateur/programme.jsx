import { useEffect, useState,useRef } from "react";
import SearchBar from "../../component/searchBar";
import { fetchGet,Fetch, fetchFormData } from "../../config/FetchRequest";
import ProgrammeBox from "../../component/programmeBox";
import Notification from "../../component/notification";
import Loader from "../../component/loader";
import PageLoader from "../../component/pageLoader";
import ModalBox from "../../component/modalBox";
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';


function Programme(){

    let [programme,setProgramme]=useState([])
    let[ID, setID]=useState(null)
    let [pageLoader,setPageLoader]=useState(false)
    let [loader,setLoader]=useState(true)
    let [pdf,setPdf]=useState()

    let notification=useRef()
    let modalBox=useRef()
    let modalBox1=useRef()
    let modalBox2=useRef()

    const defaultLayoutPluginInstance = defaultLayoutPlugin();


    useEffect(()=>{

        (async function(){

            try{
                const res= await fetchGet("getProgrammesByRole")

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

    const deleted= async(id)=>{

        try{
            modalBox.current.setModal(false)
            setPageLoader(true)
            const res= await Fetch(`deleteProgramme/${id}`,"DELETE")

            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){

                    let data=programme.filter((i)=>i.id!==id)
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

    const loadPdf=async(id,modal)=>{

        setPdf(null)
        modal.current.setModal(false)
        modalBox2.current.setModal(true)
        try{
            let res= await fetchFormData(`programme/getResolution/${id}`,"GET")
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

    const ajusted= async(id)=>{

        try{
            modalBox1.current.setModal(false)
            setPageLoader(true)
            const res= await Fetch(`ajusteProgramme/${id}`,"POST")

            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){

                    let data=programme.filter((i)=>i.id!==id)
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

    if(loader){
        return(
            <Loader/>
        )
    }

    return(
        <>

            <div className="container">

                <Notification ref={notification} />

                {pageLoader &&(
                    <PageLoader/>
                )}

                <div className="box b-search">
                    <SearchBar/>
                </div>

                {programme.length!==0?

                    programme.map((i,j)=>
                    
                        <ProgrammeBox data={i} modalBox={modalBox} modalBox1={modalBox1} onChange={setID} onLoad={loadPdf}  key={j}/>
                    
                    )
                :
                    <></>
                }
 
            </div>

            <ModalBox ref={modalBox}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer ce programme?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={()=>{deleted(ID)}}>OUI</button>
                        <button className="b-btn" onClick={()=>{modalBox.current.setModal(false)}}>NON</button>
                    </div>
                </div>
            </ModalBox>

            <ModalBox ref={modalBox1}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment ajuster ce programme?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={()=>{ajusted(ID)}}>OUI</button>
                        <button className="b-btn" onClick={()=>{modalBox1.current.setModal(false)}}>NON</button>
                    </div>
                </div>
            </ModalBox>

            <div className="view-pdf">
                <ModalBox ref={modalBox2}>
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
            

        </>
        
    )
}

export default Programme;