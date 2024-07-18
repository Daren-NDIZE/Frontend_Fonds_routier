import { useRef,useState,useEffect } from "react"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import Notification from "../../component/notification"
import PageLoader from "../../component/pageLoader"
import { useNavigate, useParams } from "react-router-dom"
import { Fetch, fetchFormData, fetchGet } from "../../config/FetchRequest"
import {  numStr, totalBudget, totalPayement } from "../../script"
import ModalBox from "../../component/modalBox"
import { Viewer } from '@react-pdf-viewer/core';
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { downLoadExcel } from "jsxtabletoexcel"



function SuiviPayement(){

    let modal=useRef()
    let modal1=useRef()
    let modal2=useRef()
    let modalBox1=useRef()
    let notification=useRef()
    let projet=useRef([])

    let AIR=useRef(null)
    let HTVA=useRef(null)

    let [programme,setProgramme]=useState({})
    let [loader,setLoader]=useState(true)
    let [erreur,setErreur]=useState("")
    let [pageLoader,setPageLoader]=useState()
    let [data,setData]=useState([])
    let [projetId,setProjetId]=useState()
    let [pdf,setPdf]=useState()
    let [montant,setMontant]=useState({TVA:"", TTC:"",AIR:"",NAP:""})
    let [categorie,setCategorie]=useState("CENTRALE")
    let [check,setCheck]=useState(false)
    let [payementId,setPayementId]=useState()
    let [focus,setFocus]=useState({})
    
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const {id}=useParams()
    const {ordonnateur}=useParams()
    const navigate=useNavigate()


    useEffect(()=>{
        (async function (){

            let type=["programme-MINT","programme-MINTP","programme-MINHDU"]
            if(isNaN(id) || !type.includes(ordonnateur)){
                navigate(-1)
                return;
            }
            try{
                let res = await fetchGet(`programme/${id}`)
                if(res.ok){
                    let resData= await res.json()
                    if(resData.type==="erreur" || resData.statut!=="VALIDER" || resData.ordonnateur!==ordonnateur.substring(10)){
                        navigate(-1)
                    }else{
                        setProgramme(resData)
                        projet.current=resData.projetList.filter((i=>i.financement!=="RESERVE" && i.bordereau ))
                        if(resData.ordonnateur==="MINTP"){
                            setData(resData.projetList.filter(i=>(i.financement!=="RESERVE"  && i.bordereau && i.categorie!=="PROJET A GESTION COMMUNALE") ))
                            return;                  
                        }
                        setData(resData.projetList.filter(i=>(i.financement!=="RESERVE" && i.bordereau ) ))
                    }
                }
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }

        })()
    },[id,ordonnateur,navigate])


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

    const changeMontant=()=>{

        let air=parseFloat(AIR.current.value) 
        let htva=parseFloat(HTVA.current.value)
        if( air && htva ){
            setMontant({TVA: (0.1925*htva).toFixed(2), TTC: (htva+ 0.1925*htva).toFixed(2) , AIR: (air*htva/100).toFixed(4) , NAP: htva*(1-air/100)})
        }else{
            setMontant({TVA:"", TTC:"",AIR:"",NAP:""})
        }
    }

    const checked=(e)=>{

        setCheck(e.target.checked)
    }

    const open=(id)=>{
        setMontant({TVA:"", TTC:"",AIR:"",NAP:""})
        setProjetId(id)
        modal.current.setModal(true) 
    }

    const openModal=(projetId,payId,modal)=>{

        setPayementId(payId)
        setProjetId(projetId)
        if(modal===modal1){
            let datas= data.find(i=>i.id===projetId)
            let paye=datas.payement.find(i=>i.id===payId)
            setFocus(paye)
            setMontant({TVA:paye.m_TVA, TTC:paye.m_TTC,AIR:paye.m_AIR,NAP:paye.nap})
        }
        modal.current.setModal(true)
    }

    const submit= async(e)=>{

        e.preventDefault()
        setErreur("")
        let form=e.target
        if(!form.air.value || !form.m_HTVA.value || !form.decompte.value ){
            setErreur("veuillez remplir tous les champs")
            return;
        }
        if( (form.air.value!=="2.2" && form.air.value!=="5.5") || isNaN(form.m_HTVA.value) ){
            setErreur("veuillez remplir correctement les champs")
            return;
        }

        let confirm=window.confirm("Voulez vous vraiment enregistrer ce payement?")
        if(!confirm){
            return;
        }

        let formData =new FormData(form);
        let data=Object.fromEntries(formData)
        modal.current.setModal(false)
        setPageLoader(true)
        try{
            let res= await Fetch(`projet/savePayement/${projetId}`,"POST",data)
            if(res.ok){
                let resData= await res.json()

                if(resData.type==="succes"){

                    let response = await fetchGet(`programme/${id}`)
                    if(response.ok){
                        let dataRes= await response.json()
                        
                        setProgramme(dataRes)
                        projet.current=dataRes.projetList.filter((i=>i.financement!=="RESERVE" && i.bordereau ))
                        if(dataRes.ordonnateur==="MINTP"){
                            setData(dataRes.projetList.filter(i=>(i.financement!=="RESERVE"  && i.bordereau && i.categorie!=="PROJET A GESTION COMMUNALE") ))
                        }else{
                            setData(dataRes.projetList.filter(i=>(i.financement!=="RESERVE" && i.bordereau ) ))
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

    const deleted=async(id)=>{

        setPageLoader(true)
        modal2.current.setModal(false)

        try{
            let res= await Fetch(`projet/deletePayement/${id}`,"DELETE")
            if(res.ok){

                let resData= await res.json()
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                if(resData.type==="succes"){
                    let index= data.indexOf(data.find(i=>i.id===projetId))
                    let paye=data[index].payement.filter(i=>i.id!==id)
                    data[index].payement=paye;
                    index= projet.current.indexOf(projet.current.find(i=>i.id===projetId))
                    projet.current[index].payement=paye
                    setData(data)
                }
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }

    }

    const update= async(e)=>{

        e.preventDefault()
        setErreur("")
        let form=e.target
        if(!form.air.value || !form.m_HTVA.value || !form.decompte.value ){
            setErreur("veuillez remplir tous les champs")
            return;
        }
        if( (form.air.value!=="2.2" && form.air.value!=="5.5") || isNaN(form.m_HTVA.value) ){
            setErreur("veuillez remplir correctement les champs")
            return;
        }

        let confirm=window.confirm("Voulez vous vraiment modifier ce payement?")
        if(!confirm){
            return;
        }

        let formData =new FormData(form);
        let data=Object.fromEntries(formData)
        modal1.current.setModal(false)
        setPageLoader(true)
        try{
            let res= await Fetch(`projet/updatePayement/${payementId}`,"PUT",data)
            if(res.ok){
                let resData= await res.json()

                if(resData.type==="succes"){

                    window.scroll({top: 0, behavior:"smooth"})
                    notification.current.setNotification(
                        {visible: true, type:resData.type,message:resData.message}
                    )

                    let response = await fetchGet(`programme/${id}`)
                    if(response.ok){
                        let dataRes= await response.json()
                        
                            setProgramme(dataRes)
                            projet.current=dataRes.projetList.filter((i=>i.financement!=="RESERVE" && i.bordereau ))
                            if(dataRes.ordonnateur==="MINTP"){
                                setData(dataRes.projetList.filter(i=>(i.financement!=="RESERVE"  && i.bordereau && i.categorie!=="PROJET A GESTION COMMUNALE") ))
                            }else{
                                setData(dataRes.projetList.filter(i=>(i.financement!=="RESERVE" && i.bordereau ) ))
                            }
                        }
                    
                }
                

            }
        }catch(e){
            console.log(e)
        }finally{
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

    const exportExcel=(fileName)=>{
        
        downLoadExcel(document.querySelector(".table"),"feuille 1","Suivi "+fileName)
    }

   
    if(loader){
        return(
            <Loader/>
        )
    }

    return(
        <div className="container pb-10 suivi" >
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
                <div id="pg-title" className="mb-25">
                    <h1>{programme.intitule}</h1>
                    <div className="check-update">
                        <label htmlFor="check">Modifier</label>
                        <input type="checkbox" id="check" onChange={checked}/>
                    </div>
                    <button className="download-btn"  onClick={()=>exportExcel(`${programme.ordonnateur} ${programme.annee}`)}>
                        <i className="fa-solid fa-down-long"></i>
                    </button>
                </div>
                {programme.ordonnateur==="MINTP" &&  
                    <div className="top-element s-change">
                        <ul>
                            <li className="active" onClick={(e)=>changeTable(e,"CENTRALE")} >Gestion centrale/regionale</li>
                            <li onClick={(e)=>changeTable(e,"COMMUNE")}>Gestion communale</li>
                        </ul>
                    </div>
            
                }
                

                
                {programme.ordonnateur==="MINHDU"?

                    <TableMINHDU 
                     data={data} 
                     programme={programme} 
                     onLoadPdf={loadPdf} 
                     onHandleClick={open} 
                     option={{check: check,openModal:openModal,modal1:modal1,modal2:modal2}} 
                     />

                :programme.ordonnateur==="MINT"?

                    <TableMINT data={data}
                     programme={programme}
                     onLoadPdf={loadPdf} 
                     onHandleClick={open} 
                     option={{check: check,openModal:openModal,modal1:modal1,modal2:modal2}}
                    />

                :  
                    <TableMINTP 
                     data={data} 
                     programme={programme} 
                     categorie={categorie}  
                     onLoadPdf={loadPdf} 
                     onHandleClick={open}
                     option={{check: check,openModal:openModal,modal1:modal1,modal2:modal2}} 
                     />

                }
               
            </div>
            
            {programme.ordonnateur==="MINHDU"?

            <div className="box">
                <div className="p-prevision">
                    <div>GESTION CENTRALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.ordonnateur==="MINHDU" )),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION COMMUNALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.ordonnateur==="MAIRE")),0)} fcfa</div>
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
                    <div>{numStr(totalBudget(programme.projetList,programme.prevision),0)} fcfa</div>
                </div>
            </div>
            
            :programme.ordonnateur==="MINT"?

            <div className="box">
                <div className="p-prevision">
                    <div>GESTION CENTRALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.ordonnateur==="MINT")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION COMMUNALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.ordonnateur==="MAIRE")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>Prévision de réserve</div>
                    <div>
                        <p>{numStr(programme.prevision,0)} fcfa</p>
                    </div>
                </div>
                <div className="p-total">
                    <div>Total</div>
                    <div>{numStr(totalBudget(programme.projetList,programme.prevision),0)} fcfa</div>
                </div>
            </div>

            :
            <div className="box">
                <div className="p-prevision">
                    <div>GESTION CENTRALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.categorie==="PROJET A GESTION CENTRALE")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION REGIONALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.categorie==="PROJET A GESTION REGIONALE")),0)} fcfa</div>
                </div>
                <div className="p-prevision">
                    <div>GESTION COMMUNALE</div>
                    <div>{numStr(totalBudget(programme.projetList.filter(i=>i.categorie==="PROJET A GESTION COMMUNALE")),0)} fcfa</div>
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
                    <div>{numStr(totalBudget(programme.projetList,programme.prevision),0)} fcfa</div>
                </div>
            </div>

            }

            <ModalBox ref={modal}>
                <form className="flex-form" onSubmit={submit} >
                    <div>
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line">
                            <label>N° decompte</label>
                            <input type="text"  name="decompte"  required/>
                        </div>
                        <div className="form-line">
                            <label>Montant hors TVA</label>
                            <input type="number" onChange={changeMontant} ref={HTVA} name="m_HTVA"  required/>
                        </div>
                        <div className="form-line">
                            <label>AIR</label>
                            <select onChange={changeMontant} name="air" ref={AIR} required>
                                <option value="">- - - - - - - - - - - - - - - - - - - - -</option>
                                <option value="2.2">2,2</option>
                                <option value="5.5">5.5</option>
                            </select>
                        </div>
                        <div className="form-line">
                            <label>Observation</label>
                            <textarea name="observation"/>
                        </div>  
                    </div>

                    <div>
                        <div className="form-line">
                            <label>Montant TVA </label>
                            <input type="number" value={montant.TVA} disabled required/>
                        </div>
                        <div className="form-line">
                            <label>Montant TTC </label>
                            <input type="number" value={montant.TTC} disabled required/>
                        </div>
                        <div className="form-line">
                            <label>Montant AIR </label>
                            <input type="number" value={montant.AIR} disabled required/>
                        </div>
                        <div className="form-line">
                            <label>Net à payer</label>
                            <input type="number" value={montant.NAP} disabled required/>
                        </div> 
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div>    
                </form>
            </ModalBox>

            <ModalBox ref={modal1}>
                <form className="flex-form" onSubmit={update} >
                    <div>
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line">
                            <label>N° decompte</label>
                            <input type="text"  name="decompte" defaultValue={focus.decompte} required/>
                        </div>
                        <div className="form-line">
                            <label>Montant hors TVA</label>
                            <input type="number" onChange={changeMontant} ref={HTVA} name="m_HTVA" defaultValue={focus.m_HTVA} required/>
                        </div>
                        <div className="form-line">
                            <label>AIR</label>
                            <select onChange={changeMontant} name="air" ref={AIR} defaultValue={focus.air} required>
                                <option value="">- - - - - - - - - - - - - - - - - - - - -</option>
                                <option value="2.2">2,2</option>
                                <option value="5.5">5.5</option>
                            </select>
                        </div>
                        <div className="form-line">
                            <label>Observation</label>
                            <textarea name="observation" defaultValue={focus.observation}/>
                        </div>  
                    </div>

                    <div>
                        <div className="form-line">
                            <label>Montant TVA </label>
                            <input type="number"  value={montant.TVA} required/>
                        </div>
                        <div className="form-line">
                            <label>Montant TTC </label>
                            <input type="number" value={montant.TTC} disabled required/>
                        </div>
                        <div className="form-line">
                            <label>Montant AIR </label>
                            <input type="number" value={montant.AIR} disabled required/>
                        </div>
                        <div className="form-line">
                            <label>Net à payer</label>
                            <input type="number" value={montant.NAP}  disabled required/>
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
                        <button className="s-btn" onClick={()=>deleted(payementId)}>OUI</button>
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

export default SuiviPayement;


const TableMINHDU=({data,programme,onLoadPdf,onHandleClick,option})=>{

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th>Ville</th>
                        <th className="min-w1">Troçons / Intitulé</th>
                        <th>Linéaire_(ml)</th>
                        <th>Cout_total_du_projet_TTC</th>
                        <th className="min-w4">Budget_antérieur</th>
                        <th className="min-w4">Budget ${programme.annee}</th>
                        <th className="min-w4">Engagement</th>
                        <th className="min-w4">Reliquat</th>
                        <th className="min-w3">Prestataire</th>
                        <th className="min-w4">Projection ${programme.annee+1}</th>
                        <th className="min-w4">Projection ${programme.annee+2}</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w4">Situation</th>
                        <th colSpan={option.check?"9":"8"} className="text-center">Suivi des payements</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((i,j)=>
                        <>
                            <tr key={j}>
                                <td rowSpan={i.payement.length +2}>{j+1}</td>
                                <td rowSpan={i.payement.length +2}>{i.region.replaceAll("_","-")}</td>
                                <td rowSpan={i.payement.length +2}>{i.ville}</td>
                                <td  rowSpan={i.payement.length +2}>{i.troçon}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.lineaire)}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.ttc)}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.budget_anterieur)}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.budget_n) }</td>
                                <td rowSpan={i.payement.length +2}>{i.suivi && numStr(i.suivi.engagement)}</td>
                                <td rowSpan={i.payement.length +2}>{(i.suivi && i.suivi.engagement!==0) && numStr((i.budget_n - i.suivi.engagement),0)}</td>
                                <td rowSpan={i.payement.length +2}>{i.prestataire}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.budget_n1)}</td>
                                <td rowSpan={i.payement.length +2}>{numStr(i.budget_n2)}</td>
                                <td rowSpan={i.payement.length +2}>{i.ordonnateur}</td>
                                <td rowSpan={i.payement.length +2}>  
                                    <p  onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>       
                                </td>
                                <td className="bold">Date</td>
                                <td className="bold">N°_decompte</td>
                                <td className="min-w4 bold">Montant HTVA</td>
                                <td className="min-w4 bold">Montant TTC</td>
                                <td className="min-w4 bold">Montant TVA</td>
                                <td className="min-w4 bold">Montant AIR</td>
                                <td className="min-w4 bold">Net à payer</td>
                                <td className="min-w2 bold">Observations</td> 
                                {option.check &&
                                <td></td>
                                } 
                            </tr>

                            {i.payement.map( (k,l)=>
                                <tr className="height-line" key={l+1}>
                                    <td>{new Date(k.date).toLocaleDateString()}</td>
                                    <td>{k.decompte}</td>
                                    <td>{k.m_HTVA}</td>
                                    <td>{k.m_TTC}</td>
                                    <td>{k.m_TVA}</td>
                                    <td>{k.m_AIR}</td>
                                    <td>{k.nap}</td>
                                    <td>{k.observation}</td>
                                    {option.check &&
                                    <td>
                                        <div className="t-action">
                                            <i className="fa-solid fa-pen-to-square" onClick={()=>option.openModal(i.id,k.id,option.modal1)}></i>
                                            <i className="fa-solid fa-trash-can" onClick={()=>option.openModal(i.id,k.id,option.modal2)}></i>
                                        </div>
                                    </td>
                                    }
                                </tr>
                            )}

                            <tr className="height-line">
                                <td colSpan="2">Total</td>
                                <td>{totalPayement(i.payement,"m_HTVA")}</td>
                                <td>{totalPayement(i.payement,"m_TTC")}</td>
                                <td>{totalPayement(i.payement,"m_TVA")}</td>
                                <td>{totalPayement(i.payement,"m_AIR")}</td>
                                <td>{totalPayement(i.payement,"nap")}</td>
                                <td>
                                    <i className="fa-solid fa-circle-plus i-circle" onClick={()=>onHandleClick(i.id)}></i>
                                </td>
                            </tr>
                        </>
                        
                    )}
                    
                </tbody>
            </table>
        </div>
    )
}

const TableMINT=({data,programme,onLoadPdf,onHandleClick,option})=>{

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
                        <th>Cout_total_du_projet_TTC</th>
                        <th className="min-w4">Budget antérieur</th>
                        <th className="min-w4">Budget ${programme.annee}</th>
                        <th className="min-w4">Engagement</th>
                        <th className="min-w4">Reliquat</th>
                        <th className="min-w3">Prestataire</th>
                        <th className="min-w4">Projection ${programme.annee+1}</th>
                        <th className="min-w4">Projection ${programme.annee+2}</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w4">situation</th>
                        <th colSpan={option.check?"9":"8"} className="text-center">Suivi des payements</th>
                    </tr>
                </thead>
                <tbody> 
                {data.map((i,j)=>
                    <>
                        <tr key={j}>
                            <td rowSpan={i.payement.length +2}>{j+1}</td>
                            <td rowSpan={i.payement.length +2}>{i.region.replaceAll("_","-")}</td>
                            <td rowSpan={i.payement.length +2}>{i.mission}</td>
                            <td rowSpan={i.payement.length +2}>{i.objectif}</td>
                            <td rowSpan={i.payement.length +2}>{i.allotissement}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.ttc,"")}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_anterieur)}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n) }</td>
                            <td rowSpan={i.payement.length +2}>{i.suivi && numStr(i.suivi.engagement)}</td>
                            <td rowSpan={i.payement.length +2}>{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                            <td rowSpan={i.payement.length +2}>{i.prestataire}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n1,"")}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n2,"")}</td>
                            <td rowSpan={i.payement.length +2}>{i.ordonnateur}</td>
                            <td rowSpan={i.payement.length +2}>
                                <p onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                            </td>
                            <td className="bold">Date</td>
                            <td className="bold">N°_decompte</td>
                            <td className="min-w4 bold">Montant HTVA</td>
                            <td className="min-w4 bold">Montant TTC</td>
                            <td className="min-w4 bold">Montant TVA</td>
                            <td className="min-w4 bold">Montant AIR</td>
                            <td className="min-w4 bold">Net à payer</td>
                            <td className="min-w2 bold">Observations</td>  
                            {option.check &&
                                <td></td>
                            }
                        </tr>

                        {i.payement.map( (k,l)=>
                            <tr className="height-line" key={l+1}>
                                <td>{new Date(k.date).toLocaleDateString()}</td>
                                <td>{k.decompte}</td>
                                <td>{k.m_HTVA}</td>
                                <td>{k.m_TTC}</td>
                                <td>{k.m_TVA}</td>
                                <td>{k.m_AIR}</td>
                                <td>{k.nap}</td>
                                <td>{k.observation}</td>
                                {option.check &&
                                <td>
                                    <div className="t-action">
                                        <i className="fa-solid fa-pen-to-square" onClick={()=>option.openModal(i.id,k.id,option.modal1)}></i>
                                        <i className="fa-solid fa-trash-can" onClick={()=>option.openModal(i.id,k.id,option.modal2)}></i>
                                    </div>
                                </td>
                                }
                            </tr>
                        )}

                        <tr className="height-line">
                            <td colSpan="2">Total</td>
                            <td>{totalPayement(i.payement,"m_HTVA")}</td>
                            <td>{totalPayement(i.payement,"m_TTC")}</td>
                            <td>{totalPayement(i.payement,"m_TVA")}</td>
                            <td>{totalPayement(i.payement,"m_AIR")}</td>
                            <td>{totalPayement(i.payement,"nap")}</td>
                            <td>
                                <i className="fa-solid fa-circle-plus i-circle" onClick={()=>onHandleClick(i.id)}></i>
                            </td>
                        </tr>
                        

                    </>
                        
                    )}
                    
                </tbody>
            </table>
        </div>
    )
}

const TableMINTP=({data,programme,categorie,onLoadPdf,onHandleClick,option})=>{

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
                    <th>Montant_TTC_projet</th>
                    <th className="min-w4">Budget antérieur</th>
                    <th className="min-w4">Budget ${programme.annee}</th>
                    <th className="min-w4">Engagement</th>
                    <th className="min-w4">Reliquat</th>
                    <th className="min-w3">Prestataire</th>
                    <th className="min-w4">Projection ${programme.annee+1}</th>
                    <th className="min-w4">Projection ${programme.annee+2}</th>
                    <th className="min-w4">Situation</th>
                    <th colSpan={option.check?"9":"8"} className="text-center">Suivi des payements</th>
                </tr>
            </thead>
                <tbody> 
                {data.map((i,j)=>
                    <>
                        <tr rowSpan={i.payement.length +2} key={j}>
                            <td rowSpan={i.payement.length +2}>{j+1}</td>
                            <td rowSpan={i.payement.length +2}>{i.region.replaceAll("_","-")}</td>
                            {categorie==="COMMUNE" &&(
                            <>
                                <td rowSpan={i.payement.length +2}>{i.departement}</td>
                                <td rowSpan={i.payement.length +2}>{i.commune}</td>
                            </>
                            )}
                            <td rowSpan={i.payement.length +2}>{i.categorie}</td>
                            <td rowSpan={i.payement.length +2}>{i.projet}</td>
                            <td rowSpan={i.payement.length +2}>{i.code_route}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.lineaire_route)}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.lineaire_oa)}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.ttc)}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_anterieur)}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n) }</td>
                            <td rowSpan={i.payement.length +2}>{i.suivi && numStr(i.suivi.engagement)}</td>
                            <td rowSpan={i.payement.length +2}>{(i.suivi && i.suivi.engagement!==0) && numStr(i.budget_n - i.suivi.engagement,0)}</td>
                            <td rowSpan={i.payement.length +2}>{i.prestataire}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n1,"")}</td>
                            <td rowSpan={i.payement.length +2}>{numStr(i.budget_n2,"")}</td>
                            <td rowSpan={i.payement.length +2}>
                                <p  onClick={()=>onLoadPdf(i.id)} className="deco">{i.suivi.statut}</p>    
                            </td>
                            <td className="bold">Date</td>
                            <td className="bold">N°_decompte</td>
                            <td className="min-w4 bold">Montant HTVA</td>
                            <td className="min-w4 bold">Montant TTC</td>
                            <td className="min-w4 bold">Montant TVA</td>
                            <td className="min-w4 bold">Montant AIR</td>
                            <td className="min-w4 bold">Net à payer</td>
                            <td className="min-w2 bold">Observations</td>
                            {option.check &&
                                <td></td>
                            }
                        </tr>

                        {i.payement.map( (k,l)=>
                            <tr className="height-line" key={l+1}>
                                <td>{new Date(k.date).toLocaleDateString()}</td>
                                <td>{k.decompte}</td>
                                <td>{k.m_HTVA}</td>
                                <td>{k.m_TTC}</td>
                                <td>{k.m_TVA}</td>
                                <td>{k.m_AIR}</td>
                                <td>{k.nap}</td>
                                <td>{k.observation}</td>
                                {option.check &&
                                <td>
                                    <div className="t-action">
                                        <i className="fa-solid fa-pen-to-square" onClick={()=>option.openModal(i.id,k.id,option.modal1)}></i>
                                        <i className="fa-solid fa-trash-can" onClick={()=>option.openModal(i.id,k.id,option.modal2)}></i>
                                    </div>
                                </td>
                                }
                            </tr>
                        )}

                        <tr className="height-line">
                            <td colSpan="2">Total</td>
                            <td>{totalPayement(i.payement,"m_HTVA")}</td>
                            <td>{totalPayement(i.payement,"m_TTC")}</td>
                            <td>{totalPayement(i.payement,"m_TVA")}</td>
                            <td>{totalPayement(i.payement,"m_AIR")}</td>
                            <td>{totalPayement(i.payement,"nap")}</td>
                            <td>
                                <i className="fa-solid fa-circle-plus i-circle" onClick={()=>onHandleClick(i.id)}></i>
                            </td>
                        </tr>
                        
                    </>
                        
                )}    
                </tbody>
            </table>
        </div>
    )
}