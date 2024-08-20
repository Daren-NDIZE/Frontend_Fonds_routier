import { useEffect, useState } from "react"
import { numStr } from "../../script"
import { Fetch } from "../../config/FetchRequest"
import PageLoader from "../../component/pageLoader"
import { downLoadExcel } from "jsxtabletoexcel"
import { useNavigate, useParams } from "react-router-dom"


function SyntheseOrdonnateur({role}){

    let date=new Date()
    const navigate=useNavigate()
    const {ordonnateur}=useParams()

    let type=["BASE","ADDITIONNEL","B&A"]


    let [synthese,setSynthese]=useState({})
    let [pageLoader,setPageLoader]=useState()

    useEffect(()=>{

        let type=["programme-MINT","programme-MINTP","programme-MINHDU"]
        if(!type.includes(ordonnateur)){
            navigate(-1)
        }
        if(role!==ordonnateur.substring(10)){
            navigate(-1)
        }
            
    },[ordonnateur,role,navigate])

    const submit=async(e)=>{

        e.preventDefault()
        let form=e.target

        if( !type.includes(form.type.value) || form.annee.value==="" || parseInt(form.annee.value) > date.getFullYear()  )
        {
            return;
        }
        setPageLoader(true)
        let formData =new FormData(form);
        let data=Object.fromEntries(formData)

        try{
            const res= await Fetch('programme/syntheseOrdonnateur',"POST",data)

            if(res.ok){
                const resData= await res.json()
                setSynthese(resData)
            }
  
        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }


    }

    const exportExcel=(fileName)=>{
        
        downLoadExcel(document.querySelector(".table"),"feuille 1","Synthese "+fileName)
    }

    return(
        <div className="container">

            <div className="box">
                <form className="s-filter" onSubmit={submit}>
                    <div>
                        <div className="form-line">
                            <label>Programme</label>
                            <input type="text" value={`Programme ${role}`} disabled/>
                        </div>
                        <div className="form-line">
                            <label>Catégorie</label>
                            <select name="type">
                                <option value="BASE">Base</option>
                                <option value="ADDITIONNEL">Additionnel</option>
                                <option value="B&A">Base & additionnel</option>
                            </select>
                        </div>
                        <div className="form-line">
                            <label>Année</label>
                            <input type="number" max={date.getFullYear()} name="annee" required/>
                        </div>
                    </div>
                    <div className="form-line">
                        <button>Valider</button>
                    </div>
                </form>
            </div>


            {synthese.type &&(

                <div className="box">

                <div id="pg-title" className="synthese-top">
                    <div>
                        <h1>Synthese {synthese.type} 2024</h1>
                    </div>
                    
                    <div>
                        <p>Situation au {date.toLocaleDateString()}</p>
                    </div>

                    <button className="download-btn" style={{marginLeft: "15px"}} onClick={()=>exportExcel(synthese.type)}>
                        <i className="fa-solid fa-down-long"></i>
                    </button>
                </div>


                {synthese.type==="MINTP"?

                    <SyntheseMINTP prevision={synthese.prevision} engagement={synthese.engagement} />

                :synthese.type==="MINT"?

                    <SyntheseMINT prevision={synthese.prevision} engagement={synthese.engagement} />
                
                :
                    <SyntheseMINHDU prevision={synthese.prevision} engagement={synthese.engagement} />

                }

                
                </div>
            )}
            

            {pageLoader &&(
                <PageLoader/>
            )}
        </div>
    )
}

export default SyntheseOrdonnateur





const SyntheseMINHDU=({prevision,engagement})=>{

    let totalP=prevision[0]+prevision[1]+prevision[2]+prevision[3]
    let totalE=engagement[0]+engagement[1]+engagement[2]+engagement[3]

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>ORDONNATEUR</th>
                        <th>CATEGORIE</th>
                        <th>PREVISION TTC</th>
                        <th>ENGAGEMENTS</th>
                        <th>Excédent/Insuffisance</th>
                        <th>Taux d'engagement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowSpan="2">MINHDU / GESTION CENTRALE</td>
                        <td>EVU</td>
                        <td>{numStr(prevision[0],0)}</td>
                        <td>{numStr(engagement[0],0)}</td>
                        <td>{numStr(prevision[0]-engagement[0],0)}</td>
                        <td>{(engagement[0]*100/prevision[0]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>ECT</td>
                        <td>{numStr(prevision[1],0)}</td>
                        <td>{numStr(engagement[1],0)}</td>
                        <td>{numStr(prevision[1]-engagement[1],0)}</td>
                        <td>{(engagement[1]*100/prevision[1]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td rowSpan="2">MINHDU / GESTION COMMUNALE</td>
                        <td>COMMUNES / TRAVAUX</td>
                        <td>{numStr(prevision[2],0)}</td>
                        <td>{numStr(engagement[2],0)}</td>
                        <td>{numStr(prevision[2]-engagement[2],0)}</td>
                        <td>{(engagement[2]*100/prevision[2]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>COMMUNES / CONTROLE</td>
                        <td>{numStr(prevision[3],0)}</td>
                        <td>{numStr(engagement[3],0)}</td>
                        <td>{numStr(prevision[3]-engagement[3],0)}</td>
                        <td>{(engagement[3]*100/prevision[3]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td colSpan="2">TOTAL</td>
                        <td>{numStr(totalP)}</td>
                        <td>{numStr(totalE,0)}</td>
                        <td>{numStr(totalP-totalE)}</td>
                        <td>{(totalE*100/totalP).toFixed(2)}%</td>
                    </tr>                    
                </tbody>
            </table>
        </div>
    )
}

const SyntheseMINTP=({prevision,engagement})=>{

    let totalP=prevision[0]+prevision[1]+prevision[2]
    let totalE=engagement[0]+engagement[1]+engagement[2]

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>ORDONNATEUR</th>
                        <th>Rubrique</th>
                        <th>PREVISION TTC</th>
                        <th>ENGAGEMENTS</th>
                        <th>Excédent/Insuffisance</th>
                        <th>Taux d'engagement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowSpan="3">MINTP</td>
                        <td>PROJETS A GESTION CENTRALE</td>
                        <td>{numStr(prevision[0],0)}</td>
                        <td>{numStr(engagement[0],0)}</td>
                        <td>{numStr(prevision[0]-engagement[0],0)}</td>
                        <td>{(engagement[0]*100/prevision[0]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>PROJETS A GESTION REGIONALE</td>
                        <td>{numStr(prevision[1],0)}</td>
                        <td>{numStr(engagement[1],0)}</td>
                        <td>{numStr(prevision[1]-engagement[1],0)}</td>
                        <td>{(engagement[1]*100/prevision[1]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>PROJETS A GESTION COMMUNALE</td>
                        <td>{numStr(prevision[2],0)}</td>
                        <td>{numStr(engagement[2],0)}</td>
                        <td>{numStr(prevision[2]-engagement[2],0)}</td>
                        <td>{(engagement[2]*100/prevision[2]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td colSpan="2">TOTAL</td>
                        <td>{numStr(totalP)}</td>
                        <td>{numStr(totalE,0)}</td>
                        <td>{numStr(totalP-totalE)}</td>
                        <td>{(totalE*100/totalP).toFixed(2)}%</td>
                    </tr>                    
                </tbody>
            </table>
        </div>
    )
}

const SyntheseMINT=({prevision,engagement})=>{

    let totalP=prevision[0]+prevision[1]
    let totalE=engagement[0]+engagement[1]
    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>ORDONNATEUR</th>
                        <th>CATEGORIE</th>
                        <th>TYPE DE TRAVAUX</th>
                        <th>PREVISION TTC</th>
                        <th>ENGAGEMENTS</th>
                        <th>Excédent/Insuffisance</th>
                        <th>Taux d'engagement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td >MINT GESTION CENTRALE</td>
                        <td rowSpan="2">PSR</td>
                        <td>Prévention et Sécurité Routières</td>
                        <td>{numStr(prevision[0],0)}</td>
                        <td>{numStr(engagement[0],0)}</td>
                        <td>{numStr(prevision[0]-engagement[0],0)}</td>
                        <td>{(engagement[0]*100/prevision[0]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>MINT GESTION COMMUNALE</td>
                        <td>PSR des communes</td>
                        <td>{numStr(prevision[1],0)}</td>
                        <td>{numStr(engagement[1],0)}</td>
                        <td>{numStr(prevision[1]-engagement[1],0)}</td>
                        <td>{(engagement[1]*100/prevision[1]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td colSpan="3">TOTAL</td>
                        <td>{numStr(totalP)}</td>
                        <td>{numStr(totalE,0)}</td>
                        <td>{numStr(totalP-totalE)}</td>
                        <td>{(totalE*100/totalP).toFixed(2)}%</td>
                    </tr>                   
                </tbody>
            </table>
        </div>
    )
}