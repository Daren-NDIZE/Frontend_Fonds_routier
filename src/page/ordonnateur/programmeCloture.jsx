import { useEffect, useRef, useState } from "react";
import SearchBar from "../../component/searchBar";
import { numStr } from "../../script";
import Loader from "../../component/loader";
import { fetchFormData, fetchGet } from "../../config/FetchRequest";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import ModalBox from "../../component/modalBox";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { Link } from "react-router-dom";


function ProgrammeCloture(){

    let [programme,setProgramme]=useState([])
    let [loader,setLoader]=useState(true)
    let [pdf,setPdf]=useState()

    let modalBox=useRef()

    const defaultLayoutPluginInstance = defaultLayoutPlugin();



    useEffect(()=>{

        (async function(){

            try{
                const res= await fetchGet("getCloseProgrammeByRole")

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

    const loadPdf=async(id)=>{

        setPdf(null)
        modalBox.current.setModal(true)
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
            <div className="box b-search">
                <SearchBar/>
            </div>
            <div className="box">
                <div id="pg-title" className="mb-25">
                    <h1>programmes cloturés</h1>
                </div>
                <div className="tableBox">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Intitulé</th>
                                <th>Ordonnateur</th>
                                <th>année</th>
                                <th>Budget</th>
                                <th>résolution</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programme.map((i,k)=>
                                <tr key={k}>
                                    <td>{k+1}</td>
                                    <td>
                                        <Link to={`/programmes_cloturés/programme-${i.ordonnateur}/${i.id}`}>{i.intitule}</Link>
                                    </td>
                                    <td>{i.ordonnateur}</td>
                                    <td>{i.annee}</td>
                                    <td>{ numStr(i.budget)}</td>
                                    <td>
                                        <i className="fa-solid fa-file-arrow-down i-circle" 
                                            style={{borderRadius: "1px"}}
                                            onClick={()=>loadPdf(i.id)}> 
                                        </i>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="view-pdf">
                <ModalBox ref={modalBox}>
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

export default ProgrammeCloture;