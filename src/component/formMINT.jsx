import { useState } from "react";


function FormMINT({title,annee,body}){

    return(
        <>
        <div className="mf-title">
            <h1>{title}</h1>
        </div>
        {body.data?
            <UpdateForm annee={annee} submit={body.function} data={body.data}/>
        :
            <Form annee={annee} submit={body.function}/>
        }
        
        </>
        
    )
}

export default FormMINT;


function Form({submit,annee}){

    let [state,setState]=useState()

    return(
        <form className="flex-form" onSubmit={submit}>
            <div>
        
                <div className="form-line">
                    <label>Region <span>*</span></label>
                    <select  name="region" required>
                        <option value="">- - - - - - - - - - - - - - - - - - - - -  </option>
                        <option value="CENTRE">CENTRE</option>
                        <option value="SUD">SUD</option>
                        <option value="EST">EST</option>
                        <option value="OUEST">OUEST</option>
                        <option value="LITTORAL">LITTORAL</option>
                        <option value="NORD">NORD</option>
                        <option value="NORD_OUEST">NORD-OUEST</option>
                        <option value="SUD_OUEST">SUD-OUEST</option>
                        <option value="ADAMAOUA">ADAMAOUA</option>
                        <option value="EXTRÊME_NORD">EXTRÊME-NORD</option>
                    </select>
                </div>

                <div className="form-line">
                    <label>Ordonnateur <span>*</span></label>
                    <select name="ordonnateur" onChange={(e)=>setState(e.target.value)} required>
                        <option value="">- - - - - - - - - - - - - - - - - -</option>
                        <option value="MINT">MINT</option>
                        <option value="MAIRE">MAIRE</option>
                    </select>
                </div>
                {state==="MAIRE"&&(
                <>
                <div className="form-line">
                    <label>Département <span>*</span></label>
                    <input type="text" name="departement" required/>
                </div>
                <div className="form-line">
                    <label>Commune <span>*</span></label>
                    <input type="text" name="commune" required/>
                </div>
                </>
                )}

                <div className="form-line">
                    <label>Activités <span>*</span></label>
                    <textarea name="mission" required></textarea>
                </div>
                <div className="form-line">
                    <label>objectifs <span>*</span></label>
                    <textarea name="objectif" required></textarea>
                </div>
                <div className="form-line">
                    <label>Allotissement</label>
                    <textarea  name="allotissement"/>
                </div>
                {state!=="MAIRE"&&(
                <div className="form-line">
                    <label>Cout total du projet TTC <span>*</span></label>
                    <input type="number" min="1" name="ttc" required/>
                </div>
                )}
                
            </div>


            <div> 
                {state==="MAIRE"&&(
                <div className="form-line">
                    <label>Cout total du projet TTC <span>*</span></label>
                    <input type="number" min="1" name="ttc" required/>
                </div>
                )}
                <div className="form-line">
                    <label>Budget antérieur</label>
                    <input type="number" min="1" name="budget_anterieur"/>
                </div>  
                <div className="form-line">
                    <label>Budget {annee} <span>*</span></label>
                    <input type="number" min="1" name="budget_n" required/>
                </div>
                <div className="form-line">
                    <label>Budget {annee+1}</label>
                    <input type="number" min="1" name="budget_n1" />
                </div>
                <div className="form-line">
                    <label>Budget {annee+2}</label>
                    <input type="number" min="1" name="budget_n2"/>
                </div>
                <div className="form-line">
                    <label>Prestataire</label>
                    <input type="text" name="prestataire"/>
                </div>

                <div className="form-line">
                    <label>observation</label>
                    <textarea name="observation"></textarea>
                </div>
                <div className="form-line" style={{margin: "0"}}>
                    <button type="submit">Enregistrer</button>
                </div>
            </div>
        </form>
    )
}

function UpdateForm({submit,data,annee}){


    return(
        <form className="flex-form" onSubmit={(e)=>submit(e,data.id)}>
            <div>
                <div className="form-line">
                    <label>Region <span>*</span></label>
                    <select  name="region" defaultValue={data.region} required>
                        <option value="">- - - - - - - - - - - - - - - - - - - - -  </option>
                        <option value="CENTRE">CENTRE</option>
                        <option value="SUD">SUD</option>
                        <option value="EST">EST</option>
                        <option value="OUEST">OUEST</option>
                        <option value="LITTORAL">LITTORAL</option>
                        <option value="NORD">NORD</option>
                        <option value="NORD_OUEST">NORD-OUEST</option>
                        <option value="SUD_OUEST">SUD-OUEST</option>
                        <option value="ADAMAOUA">ADAMAOUA</option>
                        <option value="EXTRÊME_NORD">EXTRÊME-NORD</option>
                    </select>
                </div>
                <div className="form-line">
                    <label>Ordonnateur <span>*</span></label>
                    <select name="ordonnateur" defaultValue={data.ordonnateur} required>
                        <option value="">- - - - - - - - - - - - - - - - - -</option>
                        <option value="MINT">MINT</option>
                        <option value="MAIRE">MAIRE</option>
                    </select>
                </div>
                {data.ordonnateur==="MAIRE"&&(
                <>
                <div className="form-line">
                    <label>Département <span>*</span></label>
                    <input type="text" name="departement" defaultValue={data.departement} required/>
                </div>
                <div className="form-line">
                    <label>Commune <span>*</span></label>
                    <input type="text" name="commune" defaultValue={data.commune} required/>
                </div>
                </>
                )}
                <div className="form-line">
                    <label>Activités <span>*</span></label>
                    <textarea name="mission" defaultValue={data.mission} required></textarea>
                </div>
                <div className="form-line">
                    <label>objectifs <span>*</span></label>
                    <textarea name="objectif" defaultValue={data.objectif} required></textarea>
                </div>
                <div className="form-line">
                    <label>Allotissement</label>
                    <textarea  name="allotissement" defaultValue={data.allotissement}/>
                </div>

                {data.ordonnateur==="MINT"&&(
                <div className="form-line">
                    <label>Cout total du projet TTC <span>*</span></label>
                    <input type="number" min="1" name="ttc" defaultValue={data.ttc} required/>
                </div>
                )}
                
            </div>

            <div>
                {data.ordonnateur==="MAIRE"&&(
                <div className="form-line">
                    <label>Cout total du projet TTC <span>*</span></label>
                    <input type="number" min="1" name="ttc" defaultValue={data.ttc} required/>
                </div>
                )}
                <div className="form-line">
                    <label>Budget antérieur</label>
                    <input type="number" min="0" name="budget_anterieur" defaultValue={data.budget_anterieur}/>
                </div>
                <div className="form-line">
                    <label>Budget {annee} <span>*</span></label>
                    <input type="number" min="0" name="budget_n" defaultValue={data.budget_n} required/>
                </div>
                <div className="form-line">
                    <label>Budget {annee+1}</label>
                    <input type="number" min="0" name="budget_n1" defaultValue={data.budget_n1}/>
                </div>
                <div className="form-line">
                    <label>Budget {annee+2}</label>
                    <input type="number" min="0" name="budget_n2" defaultValue={data.budget_n2} />
                </div>
                <div className="form-line">
                    <label>Prestataire</label>
                    <input type="text"  name="prestataire" defaultValue={data.prestataire}/>
                </div>
                
                <div className="form-line">
                    <label>observation</label>
                    <textarea name="observation" defaultValue={data.observation}></textarea>
                </div>
                <div className="form-line" style={{margin: "0"}}>
                    <button type="submit">Enregistrer</button>
                </div>
            </div>
        </form>
    )
}