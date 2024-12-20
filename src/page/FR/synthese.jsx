import { useState } from "react"
import { numStr } from "../../script"
import { Fetch } from "../../config/FetchRequest"
import PageLoader from "../../component/pageLoader"
import { downLoadExcel } from "jsxtabletoexcel"


function Synthese(){

    let date=new Date()

    let ordonnateur=["MINTP","MINT","MINHDU","GLOBAL"]
    let type=["BASE","ADDITIONNEL","REPORT","B&A"]

    let [synthese,setSynthese]=useState({})
    let [pageLoader,setPageLoader]=useState()

    const submit=async(e)=>{

        e.preventDefault()
        let form=e.target

        if( !ordonnateur.includes(form.ordonnateur.value) || !type.includes(form.type.value) ||
            form.annee.value==="" || parseInt(form.annee.value) > (date.getFullYear()+1)  )
        {
            return;
        }
        setPageLoader(true)
        let formData =new FormData(form);
        let data=Object.fromEntries(formData)

        try{
            const res= await Fetch('programme/syntheseProgramme',"POST",data)

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
                            <select name="ordonnateur">
                                <option value="MINTP">Programme MINTP</option>
                                <option value="MINHDU">Programme MINHDU</option>
                                <option value="MINT">Programme MINT</option>
                                <option value="GLOBAL">Global</option>
                            </select>
                        </div>
                        <div className="form-line">
                            <label>Catégorie</label>
                            <select name="type">
                                <option value="BASE">Base</option>
                                <option value="ADDITIONNEL">Additionnel</option>
                                <option value="REPORT">Report</option>
                                <option value="B&A">Base & additionnel</option>
                            </select>
                        </div>
                        <div className="form-line">
                            <label>Année</label>
                            <input type="number" max={date.getFullYear()+1} name="annee" required/>
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


                {synthese.type==="GLOBAL"?

                    <SyntheseGlobal prevision={synthese.prevision} engagement={synthese.engagement} />

                :synthese.type==="MINTP"?

                    <SyntheseMINTP prevision={synthese.prevision} engagement={synthese.engagement} lineaire={synthese.lineaire} />

                :synthese.type==="MINT"?

                    <SyntheseMINT prevision={synthese.prevision} engagement={synthese.engagement}  />
                
                :
                    <SyntheseMINHDU prevision={synthese.prevision} engagement={synthese.engagement} lineaire={synthese.lineaire} />

                }

                

                </div>
            )}
            

            {pageLoader &&(
                <PageLoader/>
            )}
        </div>
    )
}

export default Synthese



const SyntheseGlobal=({prevision,engagement})=>{

    let totalP=prevision[0]+prevision[1]+prevision[2]
    let totalE=engagement[0]+engagement[1]+engagement[2]

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>ORDONNATEUR</th>
                        <th className="min-w4">PREVISION TTC (FCFA)</th>
                        <th className="min-w4">ENGAGEMENTS (FCFA)</th>
                        <th className="min-w4">Excédent/Insuffisance (FCFA)</th>
                        <th>Taux d'engagement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>MINTP</td>
                        <td className="end">{numStr(prevision[0],0)}</td>
                        <td className="end">{numStr(engagement[0],0)}</td>
                        <td className="end">{numStr(prevision[0]-engagement[0],0)}</td>
                        <td className="end">{(engagement[0]*100/prevision[0]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>MINHDU</td>
                        <td className="end">{numStr(prevision[1],0)}</td>
                        <td className="end">{numStr(engagement[1],0)}</td>
                        <td className="end">{numStr(prevision[1]-engagement[1],0)}</td>
                        <td className="end">{(engagement[1]*100/prevision[1]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>MINT</td>
                        <td className="end">{numStr(prevision[2],0)}</td>
                        <td className="end">{numStr(engagement[2],0)}</td>
                        <td className="end">{numStr(prevision[2]-engagement[2],0)}</td>
                        <td className="end">{(engagement[2]*100/prevision[2]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>TOTAL GL</td>
                        <td className="end">{numStr(totalP)}</td>
                        <td className="end">{numStr(totalE,0)}</td>
                        <td className="end">{numStr(totalP-totalE,0)}</td>
                        <td className="end">{(totalE*100/totalP).toFixed(2)}%</td>
                    </tr>                    
                </tbody>
            </table>
        </div>
    )
}

const SyntheseMINHDU=({prevision,engagement,lineaire})=>{

    let totalP=prevision[0]+prevision[1]+prevision[2]+prevision[3]
    let totalE=engagement[0]+engagement[1]+engagement[2]+engagement[3]

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>ORDONNATEUR</th>
                        <th className="min-w4">CATEGORIE</th>
                        <th className="min-w4">PREVISION TTC (FCFA)</th>
                        <th className="min-w4">ENGAGEMENTS (FCFA)</th>
                        <th className="min-w4">Excédent/Insuffisance (FCFA)</th>
                        <th>Taux d'engagement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowSpan="2">MINHDU / GESTION CENTRALE</td>
                        <td>EVU</td>
                        <td className="end">{numStr(prevision[0],0)}</td>
                        <td className="end">{numStr(engagement[0],0)}</td>
                        <td className="end">{numStr(prevision[0]-engagement[0],0)}</td>
                        <td className="end">{(engagement[0]*100/prevision[0]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>ECT</td>
                        <td className="end">{numStr(prevision[1],0)}</td>
                        <td className="end">{numStr(engagement[1],0)}</td>
                        <td className="end">{numStr(prevision[1]-engagement[1],0)}</td>
                        <td className="end">{(engagement[1]*100/prevision[1]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td rowSpan="2">MINHDU / GESTION COMMUNALE</td>
                        <td>COMMUNES / TRAVAUX</td>
                        <td className="end">{numStr(prevision[2],0)}</td>
                        <td className="end">{numStr(engagement[2],0)}</td>
                        <td className="end">{numStr(prevision[2]-engagement[2],0)}</td>
                        <td className="end">{(engagement[2]*100/prevision[2]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>COMMUNES / CONTROLE</td>
                        <td className="end">{numStr(prevision[3],0)}</td>
                        <td className="end">{numStr(engagement[3],0)}</td>
                        <td className="end">{numStr(prevision[3]-engagement[3],0)}</td>
                        <td className="end">{(engagement[3]*100/prevision[3]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td colSpan="2">TOTAL</td>
                        <td className="end">{numStr(totalP)}</td>
                        <td className="end">{numStr(totalE,0)}</td>
                        <td className="end">{numStr(totalP-totalE,0)}</td>
                        <td className="end">{(totalE*100/totalP).toFixed(2)}%</td>
                    </tr>                    
                </tbody>
            </table>

            <table className="table">
                <thead>
                    <tr>
                        <th className="min-w4">Ordonnateur</th>
                        <th>Total Lineaire programmé (ML)</th>
                        <th>Total Lineaire financé (ML)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>MINHDU / EVU</td>
                        <td className="end">{numStr(lineaire[0],0)} ML</td>
                        <td className="end">{numStr(lineaire[1],0)} ML</td>
                    </tr>
                </tbody>

            </table>
        </div>
    )
}

const SyntheseMINTP=({prevision,engagement,lineaire})=>{

    let totalP=prevision[0]+prevision[1]+prevision[2]
    let totalE=engagement[0]+engagement[1]+engagement[2]

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>ORDONNATEUR</th>
                        <th className="min-w2">Rubrique</th>
                        <th className="min-w4">PREVISION TTC (FCFA)</th>
                        <th className="min-w4">ENGAGEMENTS (FCFA)</th>
                        <th className="min-w4">Excédent/Insuffisance (FCFA)</th>
                        <th>Taux d'engagement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowSpan="3">MINTP</td>
                        <td>PROJETS A GESTION CENTRALE</td>
                        <td className="end">{numStr(prevision[0],0)}</td>
                        <td className="end">{numStr(engagement[0],0)}</td>
                        <td className="end">{numStr(prevision[0]-engagement[0],0)}</td>
                        <td className="end">{(engagement[0]*100/prevision[0]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>PROJETS A GESTION REGIONALE</td>
                        <td className="end">{numStr(prevision[1],0)}</td>
                        <td className="end">{numStr(engagement[1],0)}</td>
                        <td className="end">{numStr(prevision[1]-engagement[1],0)}</td>
                        <td className="end">{(engagement[1]*100/prevision[1]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>PROJETS A GESTION COMMUNALE</td>
                        <td className="end">{numStr(prevision[2],0)}</td>
                        <td className="end">{numStr(engagement[2],0)}</td>
                        <td className="end">{numStr(prevision[2]-engagement[2],0)}</td>
                        <td className="end">{(engagement[2]*100/prevision[2]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td colSpan="2">TOTAL</td>
                        <td className="end">{numStr(totalP,0)}</td>
                        <td className="end">{numStr(totalE,0)}</td>
                        <td className="end">{numStr(totalP-totalE,0)}</td>
                        <td className="end">{(totalE*100/totalP).toFixed(2)}%</td>
                    </tr>                    
                </tbody>
            </table>

            <table className="table">
                <thead>
                    <tr>
                        <th className="min-w3">Type de Travaux</th>
                        <th>Total Lineaire programmé</th>
                        <th>Total Lineaire financé</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>ROUTE BITUMEE (KM)</td>
                        <td className="end">{numStr(lineaire[0],0)} KM</td>
                        <td className="end">{numStr(lineaire[1],0)} KM</td>
                    </tr>
                    <tr>
                        <td>ROUTE EN TERRE (KM)</td>
                        <td className="end">{numStr(lineaire[2],0)} KM</td>
                        <td className="end">{numStr(lineaire[3],0)} KM</td>
                    </tr>
                    <tr>
                        <td>OUVRAGE D'ART (ML)</td>
                        <td className="end">{numStr(lineaire[4],0)} ML</td>
                        <td className="end">{numStr(lineaire[5],0)} ML</td>
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
                        <th className="min-w4">ORDONNATEUR</th>
                        <th>CATEGORIE</th>
                        <th className="min-w4">TYPE DE TRAVAUX</th>
                        <th className="min-w4">PREVISION TTC (FCFA)</th>
                        <th className="min-w4">ENGAGEMENTS (FCFA)</th>
                        <th className="min-w4">Excédent/Insuffisance (FCFA)</th>
                        <th>Taux d'engagement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td >MINT GESTION CENTRALE</td>
                        <td rowSpan="2">PSR</td>
                        <td>Prévention et Sécurité Routières</td>
                        <td className="end">{numStr(prevision[0],0)}</td>
                        <td className="end">{numStr(engagement[0],0)}</td>
                        <td className="end">{numStr(prevision[0]-engagement[0],0)}</td>
                        <td className="end">{(engagement[0]*100/prevision[0]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td>MINT GESTION COMMUNALE</td>
                        <td>PSR des communes</td>
                        <td className="end">{numStr(prevision[1],0)}</td>
                        <td className="end">{numStr(engagement[1],0)}</td>
                        <td className="end">{numStr(prevision[1]-engagement[1],0)}</td>
                        <td className="end">{(engagement[1]*100/prevision[1]).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td colSpan="3">TOTAL</td>
                        <td className="end">{numStr(totalP,0)}</td>
                        <td className="end">{numStr(totalE,0)}</td>
                        <td className="end">{numStr(totalP-totalE,0)}</td>
                        <td className="end">{(totalE*100/totalP).toFixed(2)}%</td>
                    </tr>                   
                </tbody>
            </table>
        </div>
    )
}