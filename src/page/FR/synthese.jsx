import { numStr } from "../../script"


function Synthese(){

    let date=new Date()

    return(
        <div className="container">

            <div className="box">
                <div className="s-filter">
                    <div>
                        <div className="form-line">
                            <label>Programme</label>
                            <select>
                                <option>Programme MINTP</option>
                                <option>Programme MINHDU</option>
                                <option>Programme MINT</option>
                                <option>Global</option>
                            </select>
                        </div>
                        <div className="form-line">
                            <label>Catégorie</label>
                            <select>
                                <option>Base</option>
                                <option>Addditionnel</option>
                                <option>Base & additionnel</option>
                            </select>
                        </div>
                        <div className="form-line">
                            <label>Année</label>
                            <input type="number"/>
                        </div>
                    </div>
                    <div className="form-line">
                        <button>Valider</button>
                    </div>
                </div>
            </div>

            <div className="box">

                <div id="pg-title" className="synthese-top">
                    <div>
                        <h1>Programme MINHDU 2024</h1>
                    </div>
                    <div>
                        <p>Situation au {date.toLocaleDateString()}</p>
                    </div>
                </div>

                <SyntheseMINTP/>
            </div>
        </div>
    )
}

export default Synthese



const SyntheseGlobal=()=>{

    return(
        <div className="tableBox">
            <table className="table">
                <thead>
                    <tr>
                        <th>ORDONNATEUR</th>
                        <th>PREVISION TTC</th>
                        <th>ENGAGEMENTS</th>
                        <th>Excédent/Insuffisance</th>
                        <th>Taux d'engagement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>MINTP</td>
                        <td>{numStr(47008605922)}</td>
                        <td>{numStr(45286681032)}</td>
                        <td>{numStr(1721924890)}</td>
                        <td>96,34%</td>
                    </tr>
                    <tr>
                        <td>MINHDU</td>
                        <td>{numStr(8030768801)}</td>
                        <td>{numStr(5232898683)}</td>
                        <td>{numStr(5232898683)}</td>
                        <td>65,16%</td>
                    </tr>
                    <tr>
                        <td>MINTP</td>
                        <td>{numStr(2000000000)}</td>
                        <td>{numStr(1867339140)}</td>
                        <td>{numStr(132660860)}</td>
                        <td>93,37%</td>
                    </tr>
                    <tr>
                        <td>TOTAL GL</td>
                        <td>{numStr(57039374723)}</td>
                        <td>{numStr(52386918855)}</td>
                        <td>{numStr(7087484433)}</td>
                        <td>91,84%</td>
                    </tr>                    
                </tbody>
            </table>
        </div>
    )
}


const SyntheseMINHDU=()=>{

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
                        <td>{numStr(47008605922)}</td>
                        <td>{numStr(45286681032)}</td>
                        <td>{numStr(1721924890)}</td>
                        <td>96,34%</td>
                    </tr>
                    <tr>
                        <td>ECT</td>
                        <td>{numStr(8030768801)}</td>
                        <td>{numStr(5232898683)}</td>
                        <td>{numStr(5232898683)}</td>
                        <td>65,16%</td>
                    </tr>
                    <tr>
                        <td rowSpan="2">MINHDU / GESTION CENTRALE</td>
                        <td>COMMUNES / TRAVAUX</td>
                        <td>{numStr(47008605922)}</td>
                        <td>{numStr(45286681032)}</td>
                        <td>{numStr(1721924890)}</td>
                        <td>96,34%</td>
                    </tr>
                    <tr>
                        <td>COMMUNES / CONTROLE</td>
                        <td>{numStr(57039374723)}</td>
                        <td>{numStr(52386918855)}</td>
                        <td>{numStr(7087484433)}</td>
                        <td>91,84%</td>
                    </tr>
                    <tr>
                        <td colSpan="2">TOTAL</td>
                        <td>8030768801</td>
                        <td>5232898683</td>
                        <td>2797870118</td>
                        <td>65,5%</td>
                    </tr>                    
                </tbody>
            </table>
        </div>
    )
}

const SyntheseMINTP=()=>{

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
                        <td>{numStr(47008605922)}</td>
                        <td>{numStr(45286681032)}</td>
                        <td>{numStr(1721924890)}</td>
                        <td>96,34%</td>
                    </tr>
                    <tr>
                        <td>PROJETS A GESTION REGIONALE</td>
                        <td>{numStr(8030768801)}</td>
                        <td>{numStr(5232898683)}</td>
                        <td>{numStr(5232898683)}</td>
                        <td>65,16%</td>
                    </tr>
                    <tr>
                        <td>PROJETS A GESTION COMMUNALE</td>
                        <td>{numStr(47008605922)}</td>
                        <td>{numStr(45286681032)}</td>
                        <td>{numStr(1721924890)}</td>
                        <td>96,34%</td>
                    </tr>
                    <tr>
                        <td colSpan="2">TOTAL</td>
                        <td>{numStr(57039374723)}</td>
                        <td>{numStr(52386918855)}</td>
                        <td>{numStr(7087484433)}</td>
                        <td>91,84%</td>
                    </tr>                    
                </tbody>
            </table>
        </div>
    )
}