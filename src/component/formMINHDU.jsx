

function FormMINHDU({title,body,annee}){

    return(
        <>
        <div className="mf-title">
            <h1>{title}</h1>
        </div>
        {body.data?
            <UpdateForm submit={body.function} annee={annee} data={body.data}/>
        :
            <Form submit={body.function} annee={annee} />
        }
        </>
        
    )
}

export default FormMINHDU;

function Form({submit,annee}){

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
                    <label>Ville <span>*</span></label>
                    <input type="text" name="ville" required/>
                </div>
                <div className="form-line">
                    <label>Type de travaux <span>*</span></label>
                    <select name="type_travaux" required>
                        <option value="">- - - - - - - - - - - - - - - - - - - - </option>
                        <option value="ENTRETIEN DES VOIRIES URBAINES">ENTRETIEN DES VOIRIES URBAINES</option>
                        <option value="ETUDES ET CONTROLES TECHNIQUES">ETUDE DES CONTROLES TECHNIQUES</option>
                    </select>
                </div>
                <div className="form-line">
                    <label>Troçons <span>*</span></label>
                    <textarea name="troçon" required></textarea>
                </div>
                <div className="form-line">
                    <label>Linéaire(ml)</label>
                    <input type="number" step="any" name="lineaire"/>
                </div>
                <div className="form-line">
                    <label>Cout total du projet TTC <span>*</span></label>
                    <input type="number" name="ttc" min="1" required/>
                </div>
                <div className="form-line">
                    <label>Budget antérieur</label>
                    <input type="number" min="1" name="budget_anterieur"/>
                </div>
            </div>


            <div>
                
                <div className="form-line">
                    <label>Budget {annee} <span>*</span></label>
                    <input type="number" min="1" name="budget_n" required />
                </div>
                <div className="form-line">
                    <label>Budget {annee+1}</label>
                    <input type="number" min="1" name="budget_n1"/>
                </div>
                <div className="form-line">
                    <label>Budget {annee+2}</label>
                    <input type="number" min="1" name="budget_n2"/>
                </div>
                <div className="form-line">
                    <label>Prestataire</label>
                    <input type="text"  name="prestataire" />
                </div>
                <div className="form-line">
                    <label>Ordonnateur <span>*</span></label>
                    <select name="ordonnateur" required>
                        <option value=""> - - - - - - - - - - - - - - - - - - - - - - -</option>
                        <option value="MINHDU">MINHDU</option>
                        <option value="MAIRE">MAIRE</option>
                    </select>
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
                    <label>Ville <span>*</span></label>
                    <input type="text" name="ville" defaultValue={data.ville} required/>
                </div>
                <div className="form-line">
                    <label>Type de travaux <span>*</span></label>
                    <select name="type_travaux" defaultValue={data.type_travaux} required>
                        <option value="">- - - - - - - - - - - - - - - - - - - - </option>
                        <option value="ENTRETIEN DES VOIRIES URBAINES">ENTRETIEN DES VOIRIES URBAINES</option>
                        <option value="ETUDES ET CONTROLES TECHNIQUES">ETUDE DES CONTROLES TECHNIQUES</option>
                    </select>
                </div>
                <div className="form-line">
                    <label>Troçons <span>*</span></label>
                    <textarea name="troçon" defaultValue={data.troçon} required></textarea>
                </div>
                <div className="form-line">
                    <label>Linéaire(ml)</label>
                    <input type="number" name="lineaire" defaultValue={data.lineaire} step="any" />
                </div>
                <div className="form-line">
                    <label>Cout total du projet TTC <span>*</span></label>
                    <input type="number" min="1" name="ttc" defaultValue={data.ttc} required/>
                </div>
                <div className="form-line">
                    <label>Budget antérieur</label>
                    <input type="number" min="0" name="budget_anterieur" defaultValue={data.budget_anterieur} />
                </div>
                
            </div>


            <div>
                <div className="form-line">
                    <label>Budget {annee} <span>*</span></label>
                    <input type="number" min="0" name="budget_n" defaultValue={data.budget_n} required />
                </div>
                <div className="form-line">
                    <label>Budget {annee+1} </label>
                    <input type="number" min="0" name="budget_n1" defaultValue={data.budget_n1} />
                </div>
                <div className="form-line">
                    <label>Budget {annee+2}</label>
                    <input type="number" min="0" name="budget_n2" defaultValue={data.budget_n2} />
                </div>
                <div className="form-line">
                    <label>Prestataire</label>
                    <input type="text"  name="prestataire" defaultValue={data.prestataire} />
                </div>
                <div className="form-line">
                    <label>Ordonnateur <span>*</span></label>
                    <select name="ordonnateur" defaultValue={data.ordonnateur} required>
                        <option value=""> - - - - - - - - - - - - - - - - - - - - - - -</option>
                        <option value="MINHDU">MINHDU</option>
                        <option value="MAIRE">MAIRE</option>
                    </select>
                </div>
                <div className="form-line">
                    <label>observation</label>
                    <textarea name="observation" defaultValue={data.observation} ></textarea>
                </div>
                <div className="form-line" style={{margin: "0"}}>
                    <button type="submit">Enregistrer</button>
                </div>
            </div>
    </form>
    )
    

}