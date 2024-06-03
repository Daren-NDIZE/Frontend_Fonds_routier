import { useRef,useState,useEffect } from "react"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import Notification from "../../component/notification"
import PageLoader from "../../component/pageLoader"
import { Link, useNavigate, useParams } from "react-router-dom"
import { fetchFormData, fetchGet } from "../../config/FetchRequest"
import { Rejet, numStr, parseTable, selectValue, totalBudget } from "../../script"
import ModalBox from "../../component/modalBox"
import Select from 'react-select'
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

function SuiviProgramme({ordonnateur}){

    let modal=useRef()
    let modalBox1=useRef()
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

    const change=(e)=>{

        setStatut(e.target.value)

    }
    const open=(id)=>{
        setStatut("Traitment DCO")
        setProjetId(id)
        modal.current.setModal(true) 
    }

    const submit= async(e)=>{

        e.preventDefault()
        setErreur("")
        let form=e.target
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
                        setData(dataRes.projetList.filter(i=>i.financement!=="RESERVE"))
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
            setPageLoader(false)
        }

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

   
    if(loader){
        return(
            <Loader/>
        )
    }

    return(
        <div className="container pb-10 suivi" >
            <Notification ref={notification} />

            <div className="box b-search">
                <SearchBar/>
            </div>
            <div className="box">
                <div id="pg-title" className="mb-25">
                    <h1>{programme.intitule}</h1>
                </div>
                
                
                {ordonnateur==="MINHDU"?

                    <TableMINHDU data={data} programme={programme} onLoadPdf={loadPdf} onHandleClick={open} />

                :ordonnateur==="MINT"?

                    <TableMINT data={data} programme={programme} onLoadPdf={loadPdf} onHandleClick={open} />

                :<></>
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
                    <div>Prévision de réserve</div>
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
                    <div>Prévision de réserve</div>
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
                    <div>Prévision de réserve</div>
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
                <form className="flex-form" encType="multipart/form-data" onSubmit={submit} >
                    <div>
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line" >
                            <label>Situation</label>
                            <select name="statut" onChange={change} required >
                                <option value="Traitment DCO">Traitment DCO</option>
                                <option value="Traitement DAF">Traitement DAF</option>
                                <option value="En attente pour correction">En attente pour corrections</option>
                                <option value="Rejeter">Rejter</option>
                                <option value="Transmis pour visa">Transmis pour visa</option>
                                <option value="Visé">Visé</option>
                            </select>
                        </div>

                        {statut==="Rejeter" || statut==="En attente pour correction"?
                        <div className="form-line">
                            <label>Motif</label>
                            <Select options={Rejet}  placeholder="motif" onChange={setMotif} isMulti className="multi-select" />
                        </div> 
                        :<></>
                       
                        }
                        {statut==="Transmis pour visa" &&(
                            <>
                            <div className="form-line">
                                <label>Engament</label>
                                <input type="number" name="engagement"  min="0" required />
                            </div> 
                            <div className="form-line">
                                <label>Prestataire</label>
                                <input type="text" defaultValue={data.find(i=>i.id===projetId).prestataire} name="prestataire" required/>
                            </div>
                            </>     
                        )}

                        {statut==="Visé" &&(
                            <div className="form-line">
                                <label>Bordereau signé</label>
                                <input type="file" name="file" accept=".pdf" required />
                            </div> 
                        )}
                        
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div>     
                </form>
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


const TableMINHDU=({data,programme,onLoadPdf,onHandleClick})=>{

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th>Ville</th>
                        <th>Type_de_travaux</th>
                        <th>Troçons</th>
                        <th>Linéaire_(ml)</th>
                        <th>Cout_total_du_projet_TTC</th>
                        <th>Budget_antérieur</th>
                        <th>{`Budget_${programme.annee}`}</th>
                        <th>Engagement</th>
                        <th>Reliquat</th>
                        <th>Prestataire</th>
                        <th>{`Projection_${programme.annee+1}`}</th>
                        <th>{`Projection_${programme.annee+2}`}</th>
                        <th>Ordonnateurs</th>
                        <th>Observations</th>
                        <th>Situation</th>
                        <th>Motifs</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((i,j)=>
                        <tr key={j}>
                            <td>{j+1}</td>
                            <td>{i.region}</td>
                            <td >{i.ville}</td>
                            <td className="min-w1">{i.type_travaux}</td>
                            <td className="min-w1">{i.troçon}</td>
                            <td>{numStr(i.lineaire)}</td>
                            <td>{numStr(i.ttc)}</td>
                            <td className="min-w4">{numStr(i.budget_anterieur)}</td>
                            <td className="min-w4">{numStr(i.budget_n) }</td>
                            <td className="min-w4">{i.suivi && numStr(i.suivi.engagement)}</td>
                            <td className="min-w4">{(i.suivi && i.suivi.engagement!==0) && numStr((i.budget_n - i.suivi.engagement),0)}</td>
                            <td className="min-w3">{i.prestataire}</td>
                            <td className="min-w4">{numStr(i.budget_n1)}</td>
                            <td className="min-w4">{numStr(i.budget_n2)}</td>
                            <td>{i.ordonnateur}</td>
                            <td className="min-w1">{i.observation}</td>
                            <td className="min-w4">
                                {i.suivi &&(
                                    i.suivi.statut==="Visé"?
                                    <p  onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                                    :
                                    i.suivi.statut
                                )}
                            </td>
                            <td className="min-w1">
                                {i.suivi && (
                                    parseTable(i.suivi.motif).map((k,l)=><li key={l}>{k}</li>)
                                )}
                            </td>
                            <td>
                                <i className="fa-solid fa-circle-plus i-circle" onClick={()=>onHandleClick(i.id)}></i>
                            </td>
                        </tr>
                    )
                    }
                    <tr>
                        <td colSpan="8">Prévision de réserve</td>
                        <td>{numStr(programme.prevision,0)} fcfa</td>
                        <td>{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)} fcfa</td>
                        <td>{numStr(programme.prevision-totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)} fcfa</td>
                        <td colSpan="8">
                            <Link to={`/execution-des-programme/programme-MINHDU/${programme.id}/prévision`} >Détails</Link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

const TableMINT=({data,programme,onLoadPdf,onHandleClick})=>{

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°_de_lot</th>
                        <th>Region</th>
                        <th>Mission</th>
                        <th>Objectifs</th>
                        <th>Allotissement</th>
                        <th>Cout_total_du_projet_TTC</th>
                        <th>Budget_antérieur</th>
                        <th>{`Budget_${programme.annee}`}</th>
                        <th>Engagement</th>
                        <th>Reliquat</th>
                        <th>Prestataire</th>
                        <th>{`Projection_${programme.annee+1}`}</th>
                        <th>{`Projection_${programme.annee+2}`}</th>
                        <th>Ordonnateurs</th>
                        <th>Observations</th> 
                        <th>situation</th>
                        <th>Motifs</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody> 
                {data.map((i,j)=>
                        <tr key={j}>
                            <td>{j+1}</td>
                            <td>{i.region}</td>
                            <td className="min-w1">{i.mission}</td>
                            <td className="min-w1">{i.objectif}</td>
                            <td>{i.allotissement}</td>
                            <td>{numStr(i.ttc,"")}</td>
                            <td className="min-w4">{numStr(i.budget_anterieur)}</td>
                            <td className="min-w4">{numStr(i.budget_n) }</td>
                            <td className="min-w4">{i.suivi && numStr(i.suivi.engagement)}</td>
                            <td className="min-w4">{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                            <td className="min-w3">{i.prestataire}</td>
                            <td className="min-w4">{numStr(i.budget_n1,"")}</td>
                            <td className="min-w4">{numStr(i.budget_n2,"")}</td>
                            <td>{i.ordonnateur}</td>
                            <td className="min-w1">{i.observation}</td>
                            <td className="min-w4">
                                {i.suivi &&(
                                    i.suivi.statut==="Visé"?
                                    <p  onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                                    :
                                    i.suivi.statut
                                )}
                            </td>
                            <td className="min-w1">
                                {i.suivi && (
                                    parseTable(i.suivi.motif).map((k,l)=><li key={l}>{k}</li>)
                                )}
                            </td>                           
                            <td>
                                <i className="fa-solid fa-circle-plus i-circle" onClick={()=>onHandleClick(i.id)}></i>
                            </td>
                        </tr>
                    )
                    }
                    <tr>
                        <td colSpan="7">Prévision de réserve</td>
                        <td>{numStr(programme.prevision,0)} fcfa</td>
                        <td>{numStr(totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)} fcfa</td>
                        <td>{numStr(programme.prevision-totalBudget(programme.projetList.filter(i=>i.financement==="RESERVE")),0)} fcfa</td>
                        <td colSpan="8">
                            <Link to={`/execution-des-programme/programme-MINT/${programme.id}/prévision`} >Détails</Link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}