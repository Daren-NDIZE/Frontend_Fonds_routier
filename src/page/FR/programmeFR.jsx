import { useRef,useState,useEffect } from "react"
import ModalBox from "../../component/modalBox"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import Notification from "../../component/notification"
import PageLoader from "../../component/pageLoader"
import { useNavigate, useParams } from "react-router-dom"
import { fetchFormData, fetchGet} from "../../config/FetchRequest"
import { numStr, totalBudget } from "../../script"
import { downLoadExcel } from "jsxtabletoexcel"

function ProgrammeFR(){

    let modal=useRef()
    let notification=useRef()
    let projet=useRef([])

    let [programme,setProgramme]=useState({})
    let [valide,setValide]=useState(false)
    let [loader,setLoader]=useState(true)
    let [pageLoader,setPageLoader]=useState()
    let [categorie,setCategorie]=useState("CENTRALE")
    let [data,setData]=useState([])
    

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
                    let statuts=["SOUMIS","REJETER","CORRECTION"]
                    let resData= await res.json()

                    if(resData.type==="erreur" || !statuts.includes(resData.statut)){
                        navigate(-1)
                    }else{
                        setProgramme(resData)
                        projet.current=resData.projetList
                        if(resData.ordonnateur==="MINTP"){
                            setData(resData.projetList.filter(i=>i.categorie!=="PROJET A GESTION COMMUNALE"))
                            return;                  
                        }
                        setData(resData.projetList)
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
        modal.current.setModal(false)
        setPageLoader(true)

        let value=["VALIDER","REJETER","CORRECTION"]
        let form=e.target

        if(!value.includes(form.statut.value))
        {
            return;
        }

        let formData =new FormData(form);
    
        try{
            let res= await fetchFormData(`decideProgramme/${id}`,"PUT",formData)
            if(res.ok){
                let resData= await res.json()
                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
                if(resData.type==="succes"){
                    window.setTimeout(()=>{
                        navigate("/programmes/soumis")
                    },3000)
                }
            }
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }
 
    }

    const open=()=>{
        setValide(false)
        modal.current.setModal(true)
    }

    const decision=(e)=>{
        
        let value=e.target.value
        if(value==="VALIDER"){
            setValide(true)

        }else{
            setValide(false)
        }
    }

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

    const exportExcel=(fileName)=>{
        
        downLoadExcel(document.querySelector(".table"),"feuille 1",fileName)
    }
    

    if(loader){
        return(
            <Loader/>
        )
    }

    return(
        <div className="container pb-10" >
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
                <div id="pg-title" className="suivi-pg"  style={programme.ordonnateur==="MINTP"?{paddingBottom:"0px"}:{}}>
                    <div>
                        <h1>{programme.intitule}</h1>
                    </div>
                    <button className="download-btn" onClick={()=>exportExcel(programme.intitule)}>
                        <i className="fa-solid fa-down-long"></i>
                    </button>
                    {programme.statut==="SOUMIS" &&(
                    <div className="n-projet">
                        <button onClick={open} >Decision</button>
                    </div>
                    )}
                </div>
                {programme.ordonnateur==="MINTP" &&(   
                    <div className="top-element s-change">
                        <ul>
                            <li className="active" onClick={(e)=>changeTable(e,"CENTRALE")} >Gestion centrale/regionale</li>
                            <li onClick={(e)=>changeTable(e,"COMMUNE")}>Gestion communale</li>
                        </ul>
                    </div>
                )}
                
                
                {programme.ordonnateur==="MINHDU"?

                    <TableMINHDU data={data} annee={programme.annee}/>
                        
                :programme.ordonnateur==="MINT"?

                    <TableMINT data={data} annee={programme.annee}/>
                        
                :
                    <TableMINTP data={data} categorie={categorie} annee={programme.annee}/>

                }
               
            </div>

            {programme.ordonnateur==="MINHDU"?

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
                        <p>{numStr(programme.prevision,0)} fcfa
                        </p>
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
                <form encType="multipart/form-data"  className="flex-form"  onSubmit={submit}>
                    <div>
                        <div className="form-line">
                            <label>Décision</label>
                            <select name="statut" onChange={decision} required>
                                <option value="">- - - - - - - - - - - - - - - - - -</option>
                                <option value="VALIDER">VALIDER</option>
                                <option value="REJETER">REJETER</option>
                                <option value="CORRECTION">RENVOYER POUR CORRECTION</option>
                            </select>                        
                        </div>
                        <div className="form-line">
                            <label>Observation</label>
                            <textarea name="observation"/>
                        </div>
                        {valide &&(
                            <div className="form-line">
                                <label>Résolution signée</label>
                                <input type="file" name="file"  accept=".pdf" required/>
                            </div>
                        )}
                        
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

export default ProgrammeFR


const TableMINHDU=({data,annee})=>{

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Région</th>
                        <th>Ville</th>
                        <th className="min-w1">Type de travaux</th>
                        <th className="min-w1">Troçons</th>
                        <th>Linéaire_(ml)</th>
                        <th>Cout_total_du_projet_TTC</th>
                        <th className="min-w4">Budget antérieur</th>
                        <th className="min-w4">{`Budget ${annee}`}</th>
                        <th className="min-w4">{`Projection ${annee+1}`}</th>
                        <th className="min-w4">{`Projection ${annee+2}`}</th>
                        <th className="min-w3">Prestataire</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w1">Observations</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {data.map((i,j)=>
                        <tr key={j}>
                            <td>{j+1}</td>
                            <td>{i.region}</td>
                            <td >{i.ville}</td>
                            <td>{i.type_travaux}</td>
                            <td>{i.troçon}</td>
                            <td>{numStr(i.lineaire,"")}</td>
                            <td>{numStr(i.ttc,"")}</td>
                            <td>{numStr(i.budget_anterieur,"")}</td>
                            <td>{numStr(i.budget_n, " ") }</td>
                            <td>{numStr(i.budget_n1,"")}</td>
                            <td>{numStr(i.budget_n2,"")}</td>
                            <td>{i.prestataire}</td>
                            <td>{i.ordonnateur}</td>
                            <td>{i.observation}</td>
                            
                        </tr>
                    )
                    }
                </tbody>
            </table>
        </div>
    )
}

const TableMINT=({data,annee})=>{

    return(

        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>N°_de_lot</th>
                        <th>Region</th>
                        <th className="min-w1">Mission</th>
                        <th className="min-w1">Objectifs</th>
                        <th className="min-w12">Allotissement</th>
                        <th>Cout_total_du_projet_TTC</th>
                        <th className="min-w4">Budget antérieur</th>
                        <th className="min-w4">{`Budget ${annee}`}</th>
                        <th className="min-w4">{`Projection ${annee+1}`}</th>
                        <th className="min-w4">{`Projection ${annee+2}`}</th>
                        <th className="min-w3">Prestataire</th>
                        <th>Ordonnateurs</th>
                        <th className="min-w1">Observations</th> 
                    </tr>
                </thead>
                <tbody> 
                {data.map((i,j)=>
                        <tr key={j}>
                            <td>{j+1}</td>
                            <td>{i.region}</td>
                            <td>{i.mission}</td>
                            <td>{i.objectif}</td>
                            <td>{i.allotissement}</td>
                            <td>{numStr(i.ttc,"")}</td>
                            <td>{numStr(i.budget_anterieur,"")}</td>
                            <td>{numStr(i.budget_n, " ") }</td>
                            <td>{numStr(i.budget_n1,"")}</td>
                            <td>{numStr(i.budget_n2,"")}</td>
                            <td>{i.prestataire}</td>
                            <td>{i.ordonnateur}</td>
                            <td>{i.observation}</td>
                        </tr>
                    )}
                    
                </tbody>
            </table>
        </div>
    )
}

const TableMINTP=({data,categorie,annee})=>{

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
                    <th className="min-w4">Budget {annee}</th>
                    <th className="min-w4">Projection {annee+1}</th>
                    <th className="min-w4">Projection {annee+2}</th>
                    <th className="min-w3">Pretataire</th>
                    <th className="min-w1">Observations</th>
                </tr>
            </thead>
            <tbody>
            {
                data.map((i,j)=>
                <tr key={j}>
                    <td>{j+1}</td>
                    <td>{i.region}</td>
                    {categorie==="COMMUNE" &&(
                    <>
                        <td>{i.departement}</td>
                        <td>{i.commune}</td>
                    </>
                    )}
                    <td>{i.categorie}</td>
                    <td>{i.projet}</td>
                    <td>{i.code_route}</td>
                    <td>{numStr(i.lineaire_route)}</td>
                    <td>{numStr(i.lineaire_oa)}</td>
                    <td>{numStr(i.ttc)}</td>
                    <td >{numStr(i.budget_anterieur)}</td>
                    <td>{numStr(i.budget_n) }</td>
                    <td>{numStr(i.budget_n1)}</td>
                    <td>{numStr(i.budget_n2)}</td>
                    <td>{i.prestataire}</td>
                    <td>{i.observation}</td>    
                </tr>

            )}
                
            </tbody>
        </table>
        </div>
    )
}