import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Fetch, fetchGet } from "../../config/FetchRequest";
import Loader from "../../component/loader";
import SearchBar from "../../component/searchBar";
import { numStr } from "../../script";
import PageLoader from "../../component/pageLoader";
import ModalBox from "../../component/modalBox";
import Notification from "../../component/notification";
import FormMINHDU from "../../component/formMINHDU";
import FormMINTP from "../../component/formMINTP.";
import FormMINT from "../../component/formMINT";


function PrevisionFR({role}){

    let [programme,setProgramme]=useState({})
    let [data,setData]=useState([])
    let [deleteId,setDeleteId]=useState()
    let [pageLoader,setPageLoader]=useState()
    let [loader,setLoader]=useState(true)
    let [check,setCheck]=useState(false)

    let modalBox=useRef()
    let modal=useRef()
    let notification=useRef()

    const navigate=useNavigate()
    const {id}=useParams()
    const {ordonnateur}=useParams()


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
                        resData.projetList=resData.projetList.filter(i=>i.financement==="RESERVE")
                        setProgramme(resData)
                        setData(resData.projetList)
                    }
                }
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }

        })()
    },[id,ordonnateur,navigate])

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
            let typeTravaux=["ROUTE EN TERRE","ROUTE BITUMÉE","OUVRAGE D'ART"]

            if(form.projet.value==="" ||form.region.value==="" || !typeTravaux.includes(form.type_travaux.value) || !categories.includes(form.categorie.value) ||
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
        modal.current.setModal(false)

        let formData =new FormData(form);
        let datas=Object.fromEntries(formData)


        try{

            let res= await Fetch(`addProjetToProvision${programme.ordonnateur}/${id}`,"POST",datas)
            if(res.ok){
                let resData= await res.json()
                
                if(resData.type==="succes"){
                    
                    let response = await fetchGet(`programme/${id}`)
                    if(response.ok){
                        let resdata= await response.json()

                        resdata.projetList=resdata.projetList.filter(i=>i.financement==="RESERVE")
                        setProgramme(resdata)
                        setData(resdata.projetList)
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

    const deleted= async (id)=>{

        setPageLoader(true)
        modalBox.current.setModal(false)

        try{
            let res= await Fetch(`deleteProvisionProjet/${id}`,"DELETE")
            if(res.ok){
                let resData= await res.json()

                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )

                if(resData.type==="succes"){
    
                    data=data.filter(i=>i.id!==id)
                    programme.projetList=programme.projetList.filter(i=>i.id!==id)
                    setData(data)
                }
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }
 
    }

    const change=(e)=>{
        setCheck(e.target.checked)
    }

    const openModal=(id)=>{
        setDeleteId(id)
        modalBox.current.setModal(true)
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
                <div id="pg-title"> 
                    <h1>Détails prévison {`${programme.ordonnateur} ${programme.annee}`}</h1>
                    <button className="download-btn" >
                        <i className="fa-solid fa-down-long"></i>
                    </button>
                </div>
                
                { ["DCO","ADMIN"].includes(role) &&(

                    <div className="top-element">
                        <div className="check-update">
                            <label htmlFor="check">Modifier</label>
                            <input type="checkbox" id="check" onChange={change}/>
                        </div>
                        <div className="n-projet">
                            <button onClick={()=>modal.current.setModal(true)}>Nouveau</button>
                        </div>
                    </div>
                )}

                {programme.ordonnateur==="MINHDU"?

                    <MINHDU data={data} check={check} onModal={openModal} />

                :programme.ordonnateur==="MINTP"? 

                    <MINTP data={data} check={check} onModal={openModal} />
                :
                    <MINT data={data} check={check} onModal={openModal} />
                }
            </div>

            <ModalBox ref={modalBox}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer ce projet?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={()=>deleted(deleteId)}>OUI</button>
                        <button className="b-btn" onClick={()=>{modalBox.current.setModal(false)}}>NON</button>
                    </div>
                </div>
            </ModalBox>

            

            {programme.ordonnateur==="MINHDU"?
                <ModalBox ref={modal}>
                    <FormMINHDU title={"Provision MINDHU 2024"} annee={2024} body={{function: saveProjet}}/>
                </ModalBox>
            :programme.ordonnateur==="MINTP"? 
                <ModalBox ref={modal}>
                    <FormMINTP title={"Provision MINTP 2024"} annee={2024} body={{function: saveProjet}}/>
                </ModalBox>
            :
                <ModalBox ref={modal}>
                    <FormMINT title={"Provision MINT 2024"} annee={2024} body={{function: saveProjet}}/>
                </ModalBox>
            }

            {pageLoader &&(
                <PageLoader/>
            )}
        </div>
    )
}


export default PrevisionFR;

const MINHDU=({data,check,onModal})=>{

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th>Ville</th>
                        <th className="min-w13">Type_de_travaux</th>
                        <th className="min-w1">Troçons / Intitulé</th>
                        <th>Linéaire_(ml)</th>
                        <th className="min-w4">Budget total TTC</th>
                        <th className="min-w4">Engagement</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w3">Prestataires</th>
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
                            <td>{i.ville}</td>
                            <td>{i.type_travaux}</td>
                            <td>{i.troçon}</td>
                            <td className="end">{numStr(i.lineaire)}</td>
                            <td className="end">{numStr(i.ttc)} fcfa</td>
                            <td className="end">{numStr(i.budget_n)} fcfa</td>
                            <td>{i.ordonnateur}</td>
                            <td>{i.prestataire}</td>
                            {check &&(
                            <td> 
                                <div className="t-action">
                                    <i className="fa-solid fa-trash-can" onClick={()=>onModal(i.id)} ></i>
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

const MINT=({data,check,onModal})=>{

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°_de_lot</th>
                        <th>Region</th>
                        <th className="min-w1">Mission</th>
                        <th className="min-w1">Objectifs</th>
                        <th>Allotissement</th>
                        <th className="min-w4">Buget total TTC</th>
                        <th className="min-w4">Engagement</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w3">Prestataires</th> 
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
                            <td className="end">{numStr(i.ttc)} fcfa</td>
                            <td className="end">{numStr(i.budget_n)} fcfa</td>
                            <td>{i.ordonnateur}</td>
                            <td>{i.prestataire}</td>
                            {check &&(
                            <td> 
                                <div className="t-action">
                                    <i className="fa-solid fa-trash-can" onClick={()=>onModal(i.id)} ></i>
                                </div>
                            </td>
                            )}
                        </tr>
                        
                    )}
                </tbody>
            </table>
        </div>    )
}

const MINTP=({data,check,onModal})=>{

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th className="min-w2">Catégorie</th>
                        <th className="min-w1">Projets/troçons</th>
                        <th>Code route</th>
                        <th>Linéaire_route (km)</th>
                        <th>Linéaire_OA (ml)</th>
                        <th className="min-w4">Budget total TTC</th>
                        <th className="min-w4">Engagement</th>
                        <th className="min-w3">Pretataire</th>
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
                        <td>{i.categorie}</td>
                        <td>{i.projet}</td>
                        <td>{i.code_route}</td>
                        <td className="end">{numStr(i.lineaire_route)}</td>
                        <td className="end">{numStr(i.lineaire_oa)}</td>
                        <td className="end">{numStr(i.ttc)}</td>
                        <td className="end">{numStr(i.budget_n) }</td>
                        <td>{i.prestataire}</td>
                        {check &&(
                            <td> 
                                <div className="t-action">
                                    <i className="fa-solid fa-trash-can" onClick={()=>onModal(i.id)} ></i>
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